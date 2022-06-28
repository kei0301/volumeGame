import { BlockStream } from "@pricegame/shared/src/types"
import { Subject } from "rxjs"

export const blockchain = new Subject<BlockStream>()
