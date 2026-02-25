
        /** @param {NS} ns */
        export async function main(ns) {
            const t = ns.args[0];
            while(true) {
                if (ns.getServerSecurityLevel(t) > ns.getServerMinSecurityLevel(t) + 2) await ns.weaken(t);
                else if (ns.getServerMoneyAvailable(t) < ns.getServerMaxMoney(t) * 0.8) await ns.grow(t);
                else await ns.hack(t);
            }
        }