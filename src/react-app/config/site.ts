export type SiteConfig = typeof siteConfig;

export const siteConfig = {
    name: "Z²C",
    description: "Make beautiful websites regardless of your design experience.",
    navItems: [
        {
            label: "Home",
            href: "/",
        },
        {
            label: "Tone",
            href: "/tone",
        },

        {
            label: "scale",
            href: "/scale",
        },
        {
            label: "config",
            href: "/config",
        },
        {
            label: "login",
            href: "/login",
        },
    ],
    navMenuItems: [

        {
            label: "Tone",
            href: "/tone",
        },

        {
            label: "scale",
            href: "/scale",
        },
        {
            label: "config",
            href: "/config",
        },
        {
            label: "login",
            href: "/login",
        },
    ],
    links: {
        github: "https://github.com/heroui-inc/heroui",
        twitter: "https://twitter.com/hero_ui",
        docs: "https://heroui.com",
        discord: "https://discord.gg/9b6yyZKmH4",
        sponsor: "https://patreon.com/jrgarciadev",
    },
};
