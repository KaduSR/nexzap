import ShowQuickMessageService from "./ShowQuickMessageService";

const DeleteQuickMessageService = async (id: string | number): Promise<void> => {
  const quickMessage = await ShowQuickMessageService(id);
  await (quickMessage as any).destroy();
};

export default DeleteQuickMessageService;