import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import { HomeView } from 'src/sections/home/view';

const SECTION_META = {
    howItWorks: { title: 'How It Works' },
    reviews: { title: 'Reviews' },
    events: { title: 'Events' },
    services: { title: 'Services' },
};

export default function LandingSectionPage({ section }) {
    const metadata = SECTION_META[section] || SECTION_META.howItWorks;

    return (
        <>
            <Helmet>
                <title>{`${metadata.title} | ${CONFIG.site.brand}`}</title>
            </Helmet>
            <HomeView section={section} />
        </>
    );
}