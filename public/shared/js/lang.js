export function lang(message, fallback, log) {
  const lng = new URLSearchParams(location.search).get("lng");

  if (!message.no || !message.en) {
    if (log) {
      console.warn(
        "Missing a language in",
        message.no,
        message.en,
        "will use fallback",
        fallback
      );
    }
    // console.warn("Missing a language in", message.no, message.en);
    if (log) {
      console.log("fallback || message || ", fallback || message || "");
    }
    return fallback || "";
  }
  let lngMessage = message[lng];

  if (lngMessage) {
    if (log) {
      console.warn("Message found, returning:", lngMessage);
    }
    return lngMessage;
  } else {
    if (log) {
      console.warn("Translation not found", message);
    }

    return message || "";
  }
}
