const access = { id2: [30, 31] };

export function accessAllowed(userID, restaurant_id) {
  let allowed = false;

  if (access["id" + userID]) {
    if (
      access["id" + userID].find((e) => {
        return e == restaurant_id;
      })
    ) {
      allowed = true;
    }
  }
  return allowed;
}
