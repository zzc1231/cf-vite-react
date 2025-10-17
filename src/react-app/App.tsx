import { Navigate, Route, Routes } from "react-router-dom";

import IndexPage from "@/pages/index";
import DocsPage from "@/pages/docs";
import PricingPage from "@/pages/pricing";
import BlogPage from "@/pages/blog";
import AboutPage from "@/pages/about";
import TonePage from "@/pages/tone"
import Trial from "@/pages/tone/trial"
import Login from "@/pages/login";
import Logout from "@/pages/logout";
import ScalesTrainig from "@/pages/tone/scalesTraining";
import CustomConfig from "@/pages/tone/customConfig";
import { useEffect, } from "react";

import ProtectedRoute from "@/components/ProtectedRoute";


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
            <Route path="/" element={<Navigate to="/login" replace />} />

            <Route path="/trial1" element={<Trial />} />
            <Route path="/trial" element={
                <ProtectedRoute allowedStatuses={["trial"]} fallbackPath="/scale">
                    <Trial />
                </ProtectedRoute>
            } />

            <Route element={<TonePage />} path="/tone" />
            <Route element={<IndexPage />} path="/index" />
            <Route element={<DocsPage />} path="/docs" />
            <Route element={<PricingPage />} path="/pricing" />
            <Route element={<BlogPage />} path="/blog" />
            <Route element={<AboutPage />} path="/about" />

            <Route path="/scale1" element={<ScalesTrainig />} />
            <Route path="/scale" element={<ProtectedRoute allowedStatuses={["normal"]} fallbackPath="/login">
                <ScalesTrainig />
            </ProtectedRoute>} />

            <Route path="/config1" element={<CustomConfig />} />
            <Route path="/config" element={
                <ProtectedRoute allowedStatuses={["normal"]} fallbackPath="/login">
                    <CustomConfig />
                </ProtectedRoute>}
            />

            <Route path="/login1" element={<Login />} />
            <Route path="/login" element={
                <ProtectedRoute allowedStatuses={["trial"]} fallbackPath="/scale">
                    <Login />
                </ProtectedRoute>}
            />

            <Route path="/logout" element={<Logout />} />
        </Routes>
    );
}

export default App;
