import { Sequelize } from "sequelize-typescript";
import User from "../models/User";
import Setting from "../models/Setting";
import Whatsapp from "../models/Whatsapp";
import FlowCampaign from "../models/FlowCampaign";
import Ticket from "../models/Ticket";
import Queue from "../models/Queue";
import UserQueue from "../models/UserQueue";
import Tag from "../models/Tag";
import TicketTag from "../models/TicketTag";
import Contact from "../models/Contact";
import Message from "../models/Message";
import Campaign from "../models/Campaign";
import CampaignShipping from "../models/CampaignShipping";
import QuickMessage from "../models/QuickMessage";
import UserRating from "../models/UserRating";
import ScheduledMessage from "../models/ScheduledMessage";
import DunningSettings from "../models/DunningSettings";
import Incident from "../models/Incident";
import Invoice from "../models/Invoice";
import ServiceItem from "../models/ServiceItem";
import Plan from "../models/Plan";
import Company from "../models/Company";
import ApiIntegration from "../models/ApiIntegration";
import QueueIntegrations from "../models/QueueIntegrations";
import Chat from "../models/Chat";
import ChatUser from "../models/ChatUser";
import ChatMessage from "../models/ChatMessage";
import ContactList from "../models/ContactList";
import ContactListItem from "../models/ContactListItem";
import Prompt from "../models/Prompt";
import Baileys from "../models/Baileys";
import dbConfig from "../config/database";

const sequelize = new Sequelize(dbConfig as any);

sequelize.addModels([
    User, 
    Setting, 
    Whatsapp, 
    FlowCampaign, 
    Ticket, 
    Queue, 
    UserQueue, 
    Tag, 
    TicketTag,
    Contact,
    Message,
    Campaign,
    CampaignShipping,
    QuickMessage,
    UserRating,
    ScheduledMessage,
    DunningSettings,
    Incident,
    Invoice,
    ServiceItem,
    Plan,
    Company,
    ApiIntegration,
    QueueIntegrations,
    Chat,
    ChatUser,
    ChatMessage,
    ContactList,
    ContactListItem,
    Prompt,
    Baileys
]);

export default sequelize;