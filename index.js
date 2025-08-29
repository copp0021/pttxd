const { Client, GatewayIntentBits } = require("discord.js");
const { Player } = require("discord-player");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

const player = new Player(client);

// ตรวจสอบ ENV TOKEN
console.log("TOKEN length:", process.env.TOKEN?.length); 
console.log("TOKEN preview:", process.env.TOKEN?.slice(0, 10) + "..."); // แค่ดูตัวแรก 10 ตัว

client.once("ready", () => {
  console.log(`✅ บอทเพลงออนไลน์: ${client.user.tag}`);
});

// ... ส่วน messageCreate ไม่ต้องแก้

// ใส่ตรงนี้ หลัง console.log
client.login(process.env.TOKEN);
