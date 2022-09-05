import {PropertiesToSource} from "@league-of-foundry-developers/foundry-vtt-types/src/types/helperTypes";
import {ItemData} from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs";
import MerchantSheet from "../MerchantSheet";
import Logger from "../../Utils/Logger";
import MerchantCurrency from "../model/MerchantCurrency";
import HtmlHelpers from "../../Utils/HtmlHelpers";
import MerchantDragSource from "../model/MerchantDragSource";
import AddItemHolder from "../model/AddItemHolder";


export default class CurrencyCalculator {

	initialized = false;

	/**
	 * Base class for calculation for currencies. .
	 *
	 *
	 */

	actorCurrency(actor: Actor) {
		// @ts-ignore

		return actor.data.data.currency;
	}

	buyerHaveNotEnoughFunds(itemCostInGold: number, buyerFunds: number) {
		return itemCostInGold > buyerFunds;
	}

	subtractAmountFromActor(buyer: Actor, buyerFunds: number, itemCostInGold: number) {
		buyerFunds = buyerFunds - itemCostInGold;
		this.updateActorWithNewFunds(buyer, buyerFunds);
		console.log(`Merchant Sheet | Funds after purchase: ${buyerFunds}`);
	}

	addAmountForActor(seller: Actor, sellerFunds: number, price: number) {
		sellerFunds = (sellerFunds * 1) + (price * 1);
		this.updateActorWithNewFunds(seller, sellerFunds);
		console.log(`Merchant Sheet | Funds after sell: ${sellerFunds}`);
	}

	updateActorWithNewFunds(buyer: Actor, buyerFunds: number) {
		buyer.update({"data.currency": buyerFunds});
	}

	priceInText(itemCostInGold: number): string {
		return itemCostInGold.toString();
	}


	public initSettings() {
		this.initialized = true;
	}

	public prepareItems(items: any) {
		console.log("Merchant Sheet | Prepare basic Features");

		const features = {
			weapons: {
				label: "All",
				items: items,
				type: "all"
			}
		}
		return features;
	}

	async onDropItemCreate(itemData: PropertiesToSource<ItemData>, caller: MerchantSheet) {
		return caller.callSuperOnDropItemCreate(itemData);
	}

	async createScroll(itemData: PropertiesToSource<ItemData>): Promise<PropertiesToSource<ItemData>> {
		return itemData;
	}


	getPriceFromItem(item: any) {
		// @ts-ignore
		return item.system.price;
	}

	getPriceItemKey() {
		return "data.price";
	}

	getDescription(chatData: any): string {
		return chatData.value;
	}

	getQuantity(quantity: any): number {
		return quantity;
	}

	getQuantityKey(): string {
		return "data.quantity"
	}

	getWeight(itemData: any) {
		return itemData.weight;
	}
	getQuantityNumber(itemData: any): number {
		return itemData.quantity;
	}

	getPriceOutputWithModifier(basePriceItem: Item, modifier: number): string {
		// @ts-ignore
		let basePrice = basePriceItem.data.data.price
		return (Math.round((<number>basePrice) * modifier * 100) / 100).toLocaleString('en')
	}

	getPrice(priceValue: number): any {
		return priceValue;
	}

	currency(): string {
		return '';
	}

	setQuantityForItemData(data: any, quantity: number) {
		Logger.Log("Changing quantity for item and set quantity", data, quantity)
		data.quantity = quantity;
	}

	inputStyle(): string {
		return ""
	}

	editorStyle() {
		return ""
	}

	isPermissionShown() {
		return true;
	}

	sectionStyle() {
		return ""
	}
	public registerSystemSettings() {

	}

	merchantCurrency(actor: Actor): MerchantCurrency[] {
		return [{"Currency": this.actorCurrency(actor)}];
	}

	updateMerchantCurrency(actor: Actor) {
		let currency: number = HtmlHelpers.getHtmlInputNumberValue("currency-Currency", document);
		this.updateActorWithNewFunds(actor,currency);
	}

	deleteItemsOnActor(source: Actor, deletes: any[]) {
		return source.deleteEmbeddedDocuments("Item", deletes);
	}

	updateItemsOnActor(destination: Actor, destUpdates: any[]) {
		return destination.updateEmbeddedDocuments("Item", destUpdates);
	}

	addItemsToActor(destination: Actor, additions: AddItemHolder[]) {
		let addItems: any[] = []
		for (const addition of additions) {
			addItems.push(addition)
		}
		return destination.createEmbeddedDocuments("Item", addItems);
	}

	findItemByNameForActor(destination: Actor, name: string) {
		return destination.data.items.find(i => i.name == name)
	}

	isItemNotFound(destItem: Item | undefined) {
		return destItem === undefined;
	}

	updateItemAddToArray(destUpdates: any[], destItem: any, quantity: number) {
		this.setQuantityForItemData(destItem.system, Number(this.getQuantity(this.getQuantityNumber(destItem.system))) + quantity)

		if (this.getQuantity(this.getQuantityNumber(destItem.system)) < 0) {
			this.setQuantityForItemData(destItem.system, 0)
		}
		const destUpdate = {
			_id: destItem.id,
			[this.getQuantityKey()]: this.getQuantity(this.getQuantityNumber(destItem.system))
		};
		destUpdates.push(destUpdate);

	}

	isDropAccepted(dragSource: any) {
		return dragSource.type == "Item" && dragSource.actorId
	}

	getMerchantDragSource(dragSource: any): MerchantDragSource | undefined{
		if (dragSource.actorId === undefined || dragSource.type !== 'Item') {
			return undefined;
		}
		return new MerchantDragSource(this.getQuantity(this.getQuantityNumber(dragSource.system)),
			dragSource.actorId,
			this.getPriceFromItem(dragSource.data),
			dragSource.system.name,
			dragSource.system.id,
			dragSource,
			dragSource.system.img
		);
	}

	getQuantityFromItem(item: Item): number {
		return this.getQuantity(this.getQuantityNumber(item.data));
	}

	setQuantityForItem(newItem: any, quantity: number) {
		this.setQuantityForItemData(newItem.system, quantity)
	}

	getNameFromItem(newItem: any): string {
		return newItem.name;
	}

	getUpdateObject(quantityFromItem: number, quantity: number, item: any, itemId: any, infinity: boolean) {
		// @ts-ignore
		return {
			_id: itemId,

		// @ts-ignore
				[currencyCalculator.getQuantityKey()]: quantityFromItem >= Number.MAX_VALUE - 10000 || infinity ? Number.MAX_VALUE : quantityFromItem - quantity
		};
	}

	duplicateItemFromActor(item: any, source: Actor) {
		return duplicate(item);
	}
}