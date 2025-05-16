export function lang(message) {
  const lng = new URLSearchParams(location.search).get("lng");

  if (!message.no || !message.en) {
    console.warn("Missing a language in", message.no, message.en);
    return message || "";
  }
  let lngMessage = message[lng];
  if (lngMessage) {
    return lngMessage;
  } else {
    console.warn("Translation not found", message);
    return message || "";
  }
}
