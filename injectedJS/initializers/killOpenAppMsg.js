import Watcher from "../watchers/Watcher";

export default async function killOpenAppMsg() {
    const btnContainer = await Watcher.watchOnce('.XPromoPopupRpl__actions');
    const btn = btnContainer.children[1].querySelector('.XPromoPopupRpl__actionButton');
    btn.click();
}