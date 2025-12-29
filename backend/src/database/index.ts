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

// In a real scenario, use process.env vars
const dbConfig = {
  dialect: "sqlite" as const, // Cast to specific string literal for Sequelize types
  storage: "./database.sqlite", 
  logging: false,
};

const sequelize = new Sequelize({
  ...dbConfig,
  models: [
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
    Company
  ], 
});

export default sequelize;