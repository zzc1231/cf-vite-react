import { Route, Routes } from "react-router-dom";

import IndexPage from "@/pages/index";
import DocsPage from "@/pages/docs";
import PricingPage from "@/pages/pricing";
import BlogPage from "@/pages/blog";
import AboutPage from "@/pages/about";
import TonePage from "@/pages/tone"

function App() {
    return (
        <Routes>
            <Route element={<IndexPage />} path="/" />
            <Route element={<TonePage />} path="/tone" />
            <Route element={<IndexPage />} path="/index" />
            <Route element={<DocsPage />} path="/docs" />
            <Route element={<PricingPage />} path="/pricing" />
            <Route element={<BlogPage />} path="/blog" />
            <Route element={<AboutPage />} path="/about" />
        </Routes>
    );
}

export default App;
