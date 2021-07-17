// https://discord.com/oauth2/authorize?client_id=865685933710245918&scope=bot+applications.commands
const dotenv = require("dotenv");
dotenv.config();
const { Client, VoiceConnection, User } = require("discord.js");
const client = new Client();
require("discord-buttons")(client);

let {
  MessageButton,
  MessageActionRow,
  MessageMenuOption,
  MessageMenu,
} = require("discord-buttons");

let USERS = {};

let button = new MessageButton()
  .setStyle("blurple")
  .setLabel("Start listen people.")
  .setID("listen");

let button2 = new MessageButton()
  .setStyle("grey")
  .setLabel("Get time statistics")
  .setID("time");

let button3 = new MessageButton()
  .setStyle("red")
  .setLabel("Reset time")
  .setID("reset");

let row = new MessageActionRow().addComponents(button, button2, button3);

s;
class UserConnection {
  constructor(userID, username) {
    this.userID = userID;
    this.username = username;
    this.lastTime = Date.now();
    this.totalTime = 0;
    this.active = true;
  }

  update() {
    let nowTime = Date.now();
    if (this.active) {
      let diffTime = nowTime - this.lastTime;
      this.totalTime += diffTime;
    }

    this.lastTime = nowTime;
    this.active = !this.active;
  }

  getHumanTime() {
    let totalSeconds = Math.floor(this.totalTime / 1000);
    let totalMinutes = Math.floor(totalSeconds / 60);
    let remainSeconds = totalSeconds - totalMinutes * 60;
    let humanTime = `${this.username} - ${totalMinutes} min. ${remainSeconds} sec.`;
    return humanTime;
  }
}

let GET_KEYBOARD = 1;

let usersStatistics = async (message) => {
  let timeStatistics = "";
  let totalTime = 0;
  for (let userID of Object.keys(USERS)) {
    let userTotalTime = USERS[userID].totalTime;
    totalTime += userTotalTime;
  }
  for (let userID of Object.keys(USERS)) {
    let humanTime = USERS[userID].getHumanTime();
    let percents = ((USERS[userID].totalTime / totalTime) * 100).toFixed(2);
    timeStatistics += `${humanTime} - ${percents}%\n`;
  }
  if (timeStatistics.length > 0) {
    message.channel.send(timeStatistics);
  } else {
    message.channel.send("Empty");
  }
  message.defer();
};

let listenEvent = async (message) => {
  message.channel.send("⏳ Timer has started.");
  if (message.clicker.member.voice.channel) {
    const connection = await message.clicker.member.voice.channel.join();
    connection.on("speaking", (ctx) => {
      let userID = ctx.username + ctx.discriminator;
      if (USERS[userID]) {
        USERS[userID].update();
      } else {
        let userConnection = new UserConnection(userID, ctx.username);
        USERS[userID] = userConnection;
      }
    });
  }
  message.defer();
};

let resetEvent = (message) => {
  USERS = {};
  message.channel.send("✅ Timer has been reset.");
  message.defer();
};

client.on("clickButton", async (message) => {
  GET_KEYBOARD += 1;
  let buttonID = message.id;
  if (buttonID === "time") {
    usersStatistics(message);
  }

  if (buttonID === "listen") {
    listenEvent(message);
  }

  if (buttonID === "reset") {
    resetEvent(message);
  }
  if (GET_KEYBOARD % 10 == 0) {
    message.channel.send("Choose:", row);
  }
});

// client.once("ready", (message) => {
// });

client.on("message", async (message) => {
  if (message.content === "!start") message.channel.send("Choose:", row);

  // if (message.content === "!time") {
  //   usersStatistics(message);
  // }
});
client.login(process.env.BOT_TOKEN);
