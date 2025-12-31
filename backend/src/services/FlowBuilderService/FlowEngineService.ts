import { FlowCampaign } from "../../database/models/FlowCampaign.model";
import { Ticket } from "../../database/models/Ticket.model";
import { logger } from "../../utils/logger";

interface Node {
  id: string;
  type:
    | "message"
    | "choice"
    | "input"
    | "transfer"
    | "tag"
    | "condition"
    | "wait"
    | "trigger";
  data: any;
}

export const FlowEngineService = async (
  ticket: Ticket,
  msgBody: string,
  wbot: any
) => {
  // 1. New Interaction Check (Trigger)
  if (!ticket.flowCampaignId || ticket.flowStopped) {
    const flow = await (FlowCampaign as any).findOne({
      where: { phrase: msgBody.toLowerCase(), active: true },
    });

    if (flow) {
      logger.info(
        `[FlowEngine] Starting flow "${flow.name}" for Ticket ${ticket.id}`
      );
      await (ticket as any).update({
        flowCampaignId: flow.id,
        flowStepId: flow.flow.nodes[0].id, // Assuming first node is Start
        flowContext: {},
        status: "pending",
        flowStopped: false,
      });
      // Execute the first node immediately
      await processNode(
        ticket,
        flow.flow.nodes[0],
        flow.flow.nodes,
        wbot,
        msgBody
      );
      return true; // Stop other listeners
    }
    return false;
  }

  // 2. Existing Flow Processing
  const flowCampaign = await (FlowCampaign as any).findByPk(
    ticket.flowCampaignId
  );
  if (!flowCampaign) {
    await stopFlow(ticket);
    return false;
  }

  const nodeList = flowCampaign.flow.nodes;
  const currentNode = nodeList.find((n: Node) => n.id === ticket.flowStepId);

  if (!currentNode) {
    await stopFlow(ticket);
    return false;
  }

  // 3. Process Input for Current Step
  let nextNodeId = null;

  if (currentNode.type === "choice") {
    // Validate Menu Selection
    const options = currentNode.data.options || [];
    const selectedOption = options.find(
      (opt: any) =>
        opt.label.toLowerCase() === msgBody.toLowerCase() ||
        opt.value === msgBody
    );

    if (selectedOption) {
      nextNodeId = selectedOption.nextId;
    } else {
      // Invalid option
      const remoteJid = `${ticket.contact.number}@${
        ticket.isGroup ? "g.us" : "s.whatsapp.net"
      }`;
      await wbot.sendMessage(remoteJid, {
        text: "Opção inválida. Por favor, tente novamente.",
      });
      return true; // Keep in flow, don't advance
    }
  } else if (currentNode.type === "input") {
    // Save Variable
    const variableName = currentNode.data.variable || "last_input";
    const newContext = { ...ticket.flowContext, [variableName]: msgBody };
    await (ticket as any).update({ flowContext: newContext });
    nextNodeId = currentNode.data.nextId;
  } else {
    // Should not happen if logic is correct, but safe fallback
    nextNodeId = currentNode.data.nextId;
  }

  // 4. Advance to Next Node
  if (nextNodeId) {
    const nextNode = nodeList.find((n: Node) => n.id === nextNodeId);
    if (nextNode) {
      await (ticket as any).update({ flowStepId: nextNode.id });
      await processNode(ticket, nextNode, nodeList, wbot, msgBody);
    } else {
      await stopFlow(ticket); // End of flow
    }
  } else {
    await stopFlow(ticket);
  }

  return true;
};

// Recursive function to process nodes that don't wait for input
const processNode = async (
  ticket: Ticket,
  node: Node,
  nodeList: Node[],
  wbot: any,
  lastInput: string
) => {
  const remoteJid = `${ticket.contact.number}@${
    ticket.isGroup ? "g.us" : "s.whatsapp.net"
  }`;

  // Artificial typing delay
  await wbot.sendPresenceUpdate("composing", remoteJid);
  await new Promise((r) => setTimeout(r, 1000));

  // NODE: MESSAGE / TRIGGER
  if (
    node.type === "message" ||
    node.type === "trigger" ||
    node.type === "input"
  ) {
    const text = replaceVariables(
      node.data.content || "",
      ticket.flowContext,
      ticket.contact
    );
    await wbot.sendMessage(remoteJid, { text });

    // If it's just a message (not an input question), move automatically
    if (
      (node.type === "message" || node.type === "trigger") &&
      node.data.nextId
    ) {
      const nextNode = nodeList.find((n) => n.id === node.data.nextId);
      if (nextNode) {
        await (ticket as any).update({ flowStepId: nextNode.id });
        await processNode(ticket, nextNode, nodeList, wbot, lastInput);
      }
    }
  }

  // NODE: CHOICE (MENU)
  else if (node.type === "choice") {
    const title = node.data.content || "Escolha uma opção:";
    let body = `${title}\n\n`;
    node.data.options.forEach((opt: any, idx: number) => {
      body += `${opt.value}. ${opt.label}\n`;
    });
    await wbot.sendMessage(remoteJid, { text: body });
    // Stops here, waiting for user input
  }

  // NODE: TRANSFER (HANDOVER)
  else if (node.type === "transfer") {
    await (ticket as any).update({
      queueId: node.data.queueId,
      status: "pending",
      flowStopped: true,
      flowCampaignId: null,
    });
    await wbot.sendMessage(remoteJid, {
      text: "Aguarde um momento, estamos transferindo para um atendente...",
    });
  }

  // NODE: WAIT (DELAY)
  else if (node.type === "wait") {
    const ms = (node.data.seconds || 3) * 1000;
    await new Promise((r) => setTimeout(r, ms));

    if (node.data.nextId) {
      const nextNode = nodeList.find((n) => n.id === node.data.nextId);
      if (nextNode) {
        await (ticket as any).update({ flowStepId: nextNode.id });
        await processNode(ticket, nextNode, nodeList, wbot, lastInput);
      }
    }
  }

  // NODE: CONDITION
  else if (node.type === "condition") {
    const { variable, operator, value, nextIdTrue, nextIdFalse } = node.data;
    const storedValue = ticket.flowContext?.[variable];

    let conditionMet = false;

    if (operator === "equals") conditionMet = storedValue == value;
    if (operator === "contains")
      conditionMet = String(storedValue).includes(value);
    if (operator === "exists") conditionMet = !!storedValue;

    const nextId = conditionMet ? nextIdTrue : nextIdFalse;

    if (nextId) {
      const nextNode = nodeList.find((n) => n.id === nextId);
      if (nextNode) {
        await (ticket as any).update({ flowStepId: nextNode.id });
        await processNode(ticket, nextNode, nodeList, wbot, lastInput);
      }
    }
  }
};

const stopFlow = async (ticket: Ticket) => {
  await (ticket as any).update({ flowCampaignId: null, flowStepId: null });
};

const replaceVariables = (text: string, context: any, contact: any) => {
  let newText = text;
  newText = newText.replace("{{name}}", contact.name);

  if (context) {
    for (const key in context) {
      const regex = new RegExp(`{{${key}}}`, "g");
      newText = newText.replace(regex, context[key]);
    }
  }
  return newText;
};
