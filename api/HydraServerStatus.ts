export async function hydraServerStatus(
  customServerURL: string,
): Promise<boolean> {
  try {
    const response = await fetch(`${customServerURL}/api/status`);
    return (
      response.status === 200 &&
      (await response.text()) === "Hydra server is up"
    );
  } catch (_e) {
    return false;
  }
}
