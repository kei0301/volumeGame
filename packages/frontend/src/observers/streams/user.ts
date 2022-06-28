import { UserStream } from "packages/shared/src/types"
import { BehaviorSubject } from "rxjs"

export const user = new BehaviorSubject<UserStream>({ type: "user", account: undefined })
