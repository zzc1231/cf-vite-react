import { Route, Routes } from "react-router-dom";

import IndexPage from "@/pages/index";
import DocsPage from "@/pages/docs";
import PricingPage from "@/pages/pricing";
import BlogPage from "@/pages/blog";
import AboutPage from "@/pages/about";
import TonePage from "@/pages/tone"
import ScalesTrainig from "@/pages/tone/scalesTraining";
import CustomConfig from "@/pages/tone/customConfig";
import { useEffect, } from "react";


import FingerprintJS from '@fingerprintjs/fingerprintjs';

function App() {


    useEffect(() => {
        if (typeof window !== "undefined") {
            const setFp = async () => {
                const fp = await FingerprintJS.load();

                const { visitorId } = await fp.get();

                const originalFetch = window.fetch;
                window.fetch = async (input, init = {}) => {
                    init.headers = {
                        ...(init.headers || {}),
                        "X-Visitor-Id": visitorId,
                    };
                    return originalFetch(input, init);
                };
            }
            setFp();
        }
    }, []);

    return (
        <Routes>
            <Route element={<CustomConfig />} path="/" />
            <Route element={<TonePage />} path="/tone" />
            <Route element={<IndexPage />} path="/index" />
            <Route element={<DocsPage />} path="/docs" />
            <Route element={<PricingPage />} path="/pricing" />
            <Route element={<BlogPage />} path="/blog" />
            <Route element={<AboutPage />} path="/about" />
            <Route element={<ScalesTrainig />} path="/scale" />
            <Route element={<CustomConfig />} path="/config" />
        </Routes>
    );
}

export default App;
