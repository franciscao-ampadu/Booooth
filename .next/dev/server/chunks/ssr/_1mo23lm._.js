module.exports = [
"[project]/components/landing/MapDemo.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>MapDemo
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
"use client";
;
;
const PINS = [
    {
        id: "p1",
        who: "you",
        initial: "M",
        me: true,
        left: "26%",
        top: "30%",
        place: "Lindholmen",
        ago: "2 hours ago",
        date: "03.10.26",
        week: true,
        caption: "hackathon hour 3, still optimistic",
        reactions: [
            4,
            1,
            2
        ]
    },
    {
        id: "p2",
        who: "ellie",
        initial: "E",
        me: false,
        left: "58%",
        top: "66%",
        place: "Haga",
        ago: "yesterday",
        date: "02.10.26",
        week: true,
        caption: "kanelbulle the size of my head",
        reactions: [
            6,
            3,
            1
        ]
    },
    {
        id: "p3",
        who: "jonas",
        initial: "J",
        me: false,
        left: "30%",
        top: "84%",
        place: "Slottsskogen",
        ago: "4 days ago",
        date: "29.09.26",
        week: true,
        caption: "picnic, ft. one brave seagull",
        reactions: [
            2,
            5,
            0
        ]
    },
    {
        id: "p4",
        who: "you",
        initial: "M",
        me: true,
        left: "74%",
        top: "30%",
        place: "Centralen",
        ago: "2 weeks ago",
        date: "19.09.26",
        week: false,
        caption: "missed the tram, took a strip instead",
        reactions: [
            3,
            0,
            4
        ]
    },
    {
        id: "p5",
        who: "sam",
        initial: "S",
        me: false,
        left: "86%",
        top: "80%",
        place: "Järntorget",
        ago: "3 weeks ago",
        date: "12.09.26",
        week: false,
        caption: "first booth strip of the group",
        reactions: [
            8,
            2,
            2
        ]
    }
];
const FILTERS = [
    "All",
    "Me",
    "ellie",
    "jonas",
    "This week"
];
const GLYPHS = [
    "♥",
    "★",
    "☺"
];
const ring = (me)=>me ? "var(--accent)" : "var(--friend)";
function matches(pin, filter) {
    if (filter === "All") return true;
    if (filter === "Me") return pin.me;
    if (filter === "This week") return pin.week;
    return pin.who === filter;
}
// Hand-drawn streets and the river behind the pins.
function MapSketch() {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute",
                style: {
                    left: "-10%",
                    top: "44%",
                    width: "125%",
                    height: "18%",
                    borderTop: "3px solid var(--ink)",
                    borderBottom: "3px solid var(--ink)",
                    transform: "rotate(-14deg)",
                    background: "repeating-linear-gradient(135deg,transparent 0 10px,rgba(20,20,20,.16) 10px 11.5px)",
                    borderRadius: "50% 30% 60% 40% / 30% 40% 20% 30%"
                }
            }, void 0, false, {
                fileName: "[project]/components/landing/MapDemo.tsx",
                lineNumber: 46,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute font-hand text-sm text-muted",
                style: {
                    left: "60%",
                    top: "40%",
                    transform: "rotate(-14deg)"
                },
                children: "göta älv"
            }, void 0, false, {
                fileName: "[project]/components/landing/MapDemo.tsx",
                lineNumber: 61,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Line, {
                left: "-5%",
                top: "72%",
                width: "110%",
                rotate: 3
            }, void 0, false, {
                fileName: "[project]/components/landing/MapDemo.tsx",
                lineNumber: 67,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Line, {
                left: "-5%",
                top: "20%",
                width: "110%",
                rotate: -3
            }, void 0, false, {
                fileName: "[project]/components/landing/MapDemo.tsx",
                lineNumber: 68,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Line, {
                left: "44%",
                top: "55%",
                height: "60%",
                rotate: 8
            }, void 0, false, {
                fileName: "[project]/components/landing/MapDemo.tsx",
                lineNumber: 69,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Line, {
                left: "76%",
                top: "52%",
                height: "60%",
                rotate: -10
            }, void 0, false, {
                fileName: "[project]/components/landing/MapDemo.tsx",
                lineNumber: 70,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Line, {
                left: "28%",
                top: "-5%",
                height: "46%",
                rotate: -12
            }, void 0, false, {
                fileName: "[project]/components/landing/MapDemo.tsx",
                lineNumber: 71,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute",
                style: {
                    left: "12%",
                    top: "80%",
                    width: "22%",
                    height: "16%",
                    border: "2.5px solid var(--ink)",
                    borderRadius: "60% 40% 50% 50% / 50% 60% 40% 50%",
                    background: "repeating-linear-gradient(45deg,transparent 0 6px,rgba(20,20,20,.12) 6px 7.5px)"
                }
            }, void 0, false, {
                fileName: "[project]/components/landing/MapDemo.tsx",
                lineNumber: 72,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/landing/MapDemo.tsx",
        lineNumber: 45,
        columnNumber: 5
    }, this);
}
function Line({ left, top, width = "2.5px", height = "2.5px", rotate }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "absolute bg-ink",
        style: {
            left,
            top,
            width,
            height,
            transform: `rotate(${rotate}deg)`
        }
    }, void 0, false, {
        fileName: "[project]/components/landing/MapDemo.tsx",
        lineNumber: 103,
        columnNumber: 5
    }, this);
}
function MapDemo() {
    const [selectedId, setSelectedId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("p2");
    const [filter, setFilter] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("All");
    const [mine, setMine] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])({});
    const selected = PINS.find((p)=>p.id === selectedId);
    function pickFilter(next) {
        setFilter(next);
        // Keep the detail card in sync: if the open pin is filtered out, jump to
        // the first one that matches.
        if (!matches(selected, next)) {
            const first = PINS.find((p)=>matches(p, next));
            if (first) setSelectedId(first.id);
        }
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex w-full max-w-[1120px] flex-wrap items-stretch gap-7",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex flex-[1_1_560px] flex-col gap-3.5",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex flex-wrap gap-2.5",
                        children: FILTERS.map((label)=>{
                            const active = label === filter;
                            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                onClick: ()=>pickFilter(label),
                                "aria-pressed": active,
                                className: "cursor-pointer rounded-full border-[2.5px] border-ink px-[18px] py-2 text-[15px]",
                                style: {
                                    background: active ? "var(--ink)" : "transparent",
                                    color: active ? "var(--paper)" : "var(--ink)"
                                },
                                children: label
                            }, label, false, {
                                fileName: "[project]/components/landing/MapDemo.tsx",
                                lineNumber: 134,
                                columnNumber: 15
                            }, this);
                        })
                    }, void 0, false, {
                        fileName: "[project]/components/landing/MapDemo.tsx",
                        lineNumber: 130,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "relative min-h-[440px] flex-1 overflow-hidden border-[3.5px] border-ink bg-paper",
                        style: {
                            borderRadius: "200px 10px 180px 10px / 10px 180px 10px 200px"
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(MapSketch, {}, void 0, false, {
                                fileName: "[project]/components/landing/MapDemo.tsx",
                                lineNumber: 155,
                                columnNumber: 11
                            }, this),
                            PINS.map((p)=>{
                                const size = p.id === selectedId ? 62 : 46;
                                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "absolute flex flex-col items-center gap-1 transition-opacity",
                                    style: {
                                        left: p.left,
                                        top: p.top,
                                        transform: "translate(-50%,-50%)",
                                        opacity: matches(p, filter) ? 1 : 0.15
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            type: "button",
                                            onClick: ()=>setSelectedId(p.id),
                                            "aria-label": `${p.who} at ${p.place}`,
                                            className: "map-pin hatch cursor-pointer rounded-full p-0",
                                            style: {
                                                width: size,
                                                height: size,
                                                border: `5px solid ${ring(p.me)}`,
                                                boxShadow: "0 0 0 2.5px var(--ink)"
                                            }
                                        }, void 0, false, {
                                            fileName: "[project]/components/landing/MapDemo.tsx",
                                            lineNumber: 169,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "bg-paper px-1 font-hand text-sm leading-[1.2]",
                                            children: p.place
                                        }, void 0, false, {
                                            fileName: "[project]/components/landing/MapDemo.tsx",
                                            lineNumber: 181,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, p.id, true, {
                                    fileName: "[project]/components/landing/MapDemo.tsx",
                                    lineNumber: 159,
                                    columnNumber: 15
                                }, this);
                            })
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/landing/MapDemo.tsx",
                        lineNumber: 151,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/landing/MapDemo.tsx",
                lineNumber: 129,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "wobble-b flex max-w-full flex-[1_1_300px] items-start gap-[22px] border-[3px] border-ink p-[26px]",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex flex-[0_0_96px] flex-col gap-1.5 border-[2.5px] border-ink bg-white p-1.5",
                        style: {
                            transform: "rotate(-3deg)",
                            boxShadow: "4px 5px 0 rgba(20,20,20,.08)"
                        },
                        children: [
                            [
                                1,
                                2,
                                3,
                                4
                            ].map((n)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "hatch-white flex h-[66px] items-end border-[1.5px] border-ink p-[3px] font-mono text-[8px] text-muted",
                                    children: [
                                        "frame ",
                                        n
                                    ]
                                }, n, true, {
                                    fileName: "[project]/components/landing/MapDemo.tsx",
                                    lineNumber: 199,
                                    columnNumber: 13
                                }, this)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "text-center font-mono text-[8px] text-ink",
                                children: selected.date
                            }, void 0, false, {
                                fileName: "[project]/components/landing/MapDemo.tsx",
                                lineNumber: 206,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/landing/MapDemo.tsx",
                        lineNumber: 191,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex min-w-0 flex-1 flex-col gap-3.5",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center gap-2.5",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "flex h-[34px] w-[34px] items-center justify-center rounded-full font-hand text-[15px]",
                                        style: {
                                            border: `3.5px solid ${ring(selected.me)}`
                                        },
                                        children: selected.initial
                                    }, void 0, false, {
                                        fileName: "[project]/components/landing/MapDemo.tsx",
                                        lineNumber: 213,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex flex-col",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                className: "text-[17px] font-medium",
                                                children: selected.who
                                            }, void 0, false, {
                                                fileName: "[project]/components/landing/MapDemo.tsx",
                                                lineNumber: 220,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-[13px] text-muted",
                                                children: selected.ago
                                            }, void 0, false, {
                                                fileName: "[project]/components/landing/MapDemo.tsx",
                                                lineNumber: 221,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/landing/MapDemo.tsx",
                                        lineNumber: 219,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/landing/MapDemo.tsx",
                                lineNumber: 212,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "font-hand text-xl leading-[1.35] text-pretty",
                                children: [
                                    "“",
                                    selected.caption,
                                    "”"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/landing/MapDemo.tsx",
                                lineNumber: 224,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "text-sm text-body",
                                children: [
                                    "near ",
                                    selected.place
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/landing/MapDemo.tsx",
                                lineNumber: 227,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "mt-1 flex flex-wrap gap-2",
                                children: GLYPHS.map((glyph, i)=>{
                                    const key = selected.id + i;
                                    const on = !!mine[key];
                                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        type: "button",
                                        "aria-pressed": on,
                                        onClick: ()=>setMine((m)=>({
                                                    ...m,
                                                    [key]: !m[key]
                                                })),
                                        className: "flex cursor-pointer items-center gap-1.5 rounded-full border-[2.5px] border-ink px-3.5 py-1.5 text-[15px] text-ink",
                                        style: {
                                            background: on ? "#FFE3E8" : "transparent"
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                children: glyph
                                            }, void 0, false, {
                                                fileName: "[project]/components/landing/MapDemo.tsx",
                                                lineNumber: 241,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                children: selected.reactions[i] + (on ? 1 : 0)
                                            }, void 0, false, {
                                                fileName: "[project]/components/landing/MapDemo.tsx",
                                                lineNumber: 242,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, glyph, true, {
                                        fileName: "[project]/components/landing/MapDemo.tsx",
                                        lineNumber: 233,
                                        columnNumber: 17
                                    }, this);
                                })
                            }, void 0, false, {
                                fileName: "[project]/components/landing/MapDemo.tsx",
                                lineNumber: 228,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/landing/MapDemo.tsx",
                        lineNumber: 211,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/landing/MapDemo.tsx",
                lineNumber: 190,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/landing/MapDemo.tsx",
        lineNumber: 128,
        columnNumber: 5
    }, this);
}
}),
"[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

module.exports = __turbopack_context__.r("[project]/node_modules/next/dist/server/route-modules/app-page/module.compiled.js [app-ssr] (ecmascript)").vendored['react-ssr'].ReactJsxDevRuntime;
}),
];

//# sourceMappingURL=_1mo23lm._.js.map