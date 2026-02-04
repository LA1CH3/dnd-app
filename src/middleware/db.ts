import { createMiddleware } from "@tanstack/react-start";

export const dbMiddleware = createMiddleware({ type: 'function'}).server(({ next }) => {
    // setup drizzle d1 connection
    return next({
        context: {
            db: undefined,
        },
    })
})