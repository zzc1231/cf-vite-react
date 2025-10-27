import { Navigate, Route, Routes } from "react-router-dom";

import IndexPage from "@/pages/index";
import DocsPage from "@/pages/docs";
import PricingPage from "@/pages/pricing";
import BlogPage from "@/pages/blog";
import AboutPage from "@/pages/about";
import TonePage from "@/pages/tone"
import Trial from "@/pages/tone/trial"
import Guide from "@/pages/tone/guide"
import Login from "@/pages/login";
import Logout from "@/pages/logout";
import ScalesTrainig from "@/pages/tone/scalesTraining";
import CustomConfig from "@/pages/tone/customConfig";

import { useEffect, } from "react";

import ProtectedRoute from "@/components/ProtectedRoute";


import FingerprintJS from '@fingerprintjs/fingerprintjs';
import DefaultLayout from "@/layouts/default";
import BlankLayout from "@/layouts/blank";
import CoursesWrapper from "@/pages/courses/CoursesWrapper";

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

            <Route element={<DefaultLayout />}>
                <Route path="/trial" element={
                    <ProtectedRoute allowedStatuses={["trial"]} fallbackPath="/scale">
                        <Trial />
                    </ProtectedRoute>
                } />
                <Route path="/trial1" element={<Trial />} />


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

                <Route path="/guide" element={<Guide />} />

                <Route path="/tone" element={<TonePage />} />
                <Route path="/index" element={<IndexPage />} />
                <Route path="/docs" element={<DocsPage />} />
                <Route path="/pricing" element={<PricingPage />} />
                <Route path="/blog" element={<BlogPage />} />
                <Route path="/about" element={<AboutPage />} />


                {/* === 动态课程路由 === */}
                <Route path="/courses/*" element={<CoursesWrapper />} />

            </Route>


            <Route element={<BlankLayout />}>
                <Route path="/s/trial" element={
                    <ProtectedRoute allowedStatuses={["trial"]} fallbackPath="/scale">
                        <Trial />
                    </ProtectedRoute>
                } />
                <Route path="/s/trial1" element={<Trial />} />


                <Route path="/s/scale1" element={<ScalesTrainig />} />
                <Route path="/s/scale" element={<ProtectedRoute allowedStatuses={["normal"]} fallbackPath="/login">
                    <ScalesTrainig />
                </ProtectedRoute>} />

                <Route path="/s/config1" element={<CustomConfig />} />
                <Route path="'s/config" element={
                    <ProtectedRoute allowedStatuses={["normal"]} fallbackPath="/login">
                        <CustomConfig />
                    </ProtectedRoute>}
                />

                <Route path="/s/tone" element={<TonePage />} />
                <Route path="/s/index" element={<IndexPage />} />
                <Route path="/s/docs" element={<DocsPage />} />
                <Route path="/s/pricing" element={<PricingPage />} />
                <Route path="/s/blog" element={<BlogPage />} />
                <Route path="/s/about" element={<AboutPage />} />
            </Route>



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
