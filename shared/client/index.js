import mqtt from "async-mqtt";

const transformTopicToRegex = (topic) =>
  new RegExp(topic.replace(/\+/g, "[\\w\\d]+?").replace(/#/g, ".*"));

export const initializeClient = async ({ host, port }) => {
  const client = await mqtt.connectAsync({
    host,
    port,
  });

  const handlers = {};

  client.on("message", async (topic, message, packet) => {
    for (const { topicRegex, handler } of Object.values(handlers)) {
      if (topic.match(topicRegex)) {
        await handler(topic, message, packet);
      }
    }
  });

  client.subscribeWithHandler = async (topic, handler, options) => {
    handlers[topic] = {
      topic,
      topicRegex: transformTopicToRegex(topic),
      handler,
    };
    await client.subscribe(topic, options);
  };

  console.log("MQTT client connected.");

  return client;
};
