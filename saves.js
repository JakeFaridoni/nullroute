export function loadSaves() {
  return JSON.parse(localStorage.getItem('nullroute_saves') || '{}');
}

export async function saveGame(player, targets) {
  const saves = loadSaves();
  const toSave = { ...player };
  if (toSave.password && !toSave.password.startsWith('$2')) {
    toSave.password = await bcrypt.hash(toSave.password, 10);
  }
  saves[player.handle] = { player: toSave, targets };
  localStorage.setItem('nullroute_saves', JSON.stringify(saves));
}

export function loadSave(handle) {
  const saves = loadSaves();
  return saves[handle.toUpperCase()] || null;
}

export async function verifyPassword(input, hashed) {
  return await bcrypt.compare(input, hashed);
}