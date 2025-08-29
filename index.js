const { Client, GatewayIntentBits } = require("discord.js");
const { Player, QueryType } = require("discord-player");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

const player = new Player(client);

// Debug ENV
console.log("TOKEN length:", process.env.TOKEN?.length);
console.log("TOKEN preview:", process.env.TOKEN?.slice(0, 10) + "...");

client.once("ready", () => {
  console.log(`✅ บอทเพลงออนไลน์: ${client.user.tag}`);
});

client.on("messageCreate", async (msg) => {
  if (!msg.guild) return;
  const args = msg.content.split(" ");

  // =================== !play ===================
  if (args[0] === "!play") {
    if (!msg.member.voice.channel)
      return msg.reply("❌ เข้าห้องเสียงก่อนครับ");

    const query = args.slice(1).join(" ");
    if (!query) return msg.reply("⚠️ ใส่ชื่อเพลงหรือ URL ด้วยครับ");

    const queue = await player.nodes.create(msg.guild, { metadata: msg.channel });

    // เข้าห้องเสียงก่อน
    try {
      if (!queue.connection)
        await queue.connect(msg.member.voice.channel);
      console.log(`✅ บอทเข้าห้องเสียง ${msg.member.voice.channel.name}`);
    } catch {
      player.deleteQueue(msg.guild.id);
      return msg.reply("❌ ไม่สามารถเข้าห้องเสียงได้");
    }

    // Search เพลงจาก YouTube
    const searchResult = await player.search(query, {
      requestedBy: msg.author,
      searchEngine: QueryType.YOUTUBE
    });

    console.log("Query:", query);
    console.log("Tracks found:", searchResult.tracks.length);
    console.log(searchResult.tracks.map(t => t.title));

    if (!searchResult || !searchResult.tracks.length)
      return msg.reply("❌ ไม่เจอเพลงนี้");

    // เพิ่มเพลงลง queue และเล่น
    queue.addTrack(searchResult.tracks[0]);
    if (!queue.isPlaying()) await queue.node.play();

    msg.reply(`▶️ กำลังเล่น: **${searchResult.tracks[0].title}**`);
  }

  // =================== !skip ===================
  if (args[0] === "!skip") {
    const queue = player.nodes.get(msg.guild.id);
    if (!queue) return msg.reply("❌ ไม่มีเพลงที่เล่นอยู่");
    queue.node.skip();
    msg.reply("⏭️ ข้ามเพลงแล้ว");
  }

  // =================== !stop ===================
  if (args[0] === "!stop") {
    const queue = player.nodes.get(msg.guild.id);
    if (!queue) return msg.reply("❌ ไม่มีเพลงที่เล่นอยู่");
    queue.delete();
    msg.reply("⏹️ หยุดเล่นเพลงแล้ว");
  }
});

// =================== Login ===================
client.login(process.env.TOKEN);
