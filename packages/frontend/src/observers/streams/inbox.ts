import { Subject } from "rxjs"
import { InboxStream } from "@pricegame/shared/src/types"

export const inbox = new Subject<InboxStream>()
