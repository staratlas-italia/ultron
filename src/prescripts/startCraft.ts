import { Conf } from "../common/makeConf";
import { SageCrafting } from "../core/SageCrafting";
import { SagePlayer } from "../core/SagePlayer";
import { craftV2 } from "../scripts/craftV2";
import { setCraftingConfirm } from "../utils/inputsV2/setCraftingConfirm";
import { setCraftingQuantity } from "../utils/inputsV2/setCraftingQuantity";
import { setCraftingStarbase } from "../utils/inputsV2/setCraftingStarbase";
import { setNumCrew } from "../utils/inputsV2/setNumCrew";
import { setRecipe } from "../utils/inputsV2/setRecipe";

export const startCraft =
  (conf: Pick<Conf, "activity">) => async (player: SagePlayer) => {
    // 2. init crafting
    const crafting = await SageCrafting.init(player);

    // 3. set crafting starbase
    const starbase = await setCraftingStarbase(
      crafting,
      "Choose the crafting starbase:"
    );
    if (starbase.type !== "Success") return starbase;

    // 4. set recipe
    const recipe = await setRecipe(starbase.data, crafting);
    if (recipe.type !== "Success") return recipe;

    // 5. set quantity
    const maxCraftableQuantity = await crafting.getMaxAvailableQuantity(
      starbase.data,
      recipe.data
    );
    if (maxCraftableQuantity.type !== "Success") return maxCraftableQuantity;
    const quantity = await setCraftingQuantity(maxCraftableQuantity.data);

    // 6. set num crew
    const availableCrew = await crafting.getAvailableCrew(starbase.data);
    if (availableCrew.type !== "Success") return availableCrew;
    const numCrew = await setNumCrew(availableCrew.data);

    // 7. confirm
    const confirm = await setCraftingConfirm(
      recipe.data,
      quantity,
      numCrew,
      crafting
    );
    if (confirm !== "Yes") return { type: "CraftingProcessAborted" as const };

    // 8. start craft loop
    for (let i = 0; i < conf.activity.cycles; i++) {
      const craft = await craftV2(
        crafting,
        starbase.data,
        recipe.data,
        quantity,
        numCrew
      );
      if (craft.type !== "Success") {
        return craft;
      }
    }

    return { type: "Success" } as const;
  };
