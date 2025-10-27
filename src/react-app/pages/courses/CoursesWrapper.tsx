import { JSX, lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";


// === 动态导入所有课程模块 ===
const courseModules = import.meta.glob("@/pages/courses/*/index.tsx");
const unitModules = import.meta.glob("@/pages/courses/*/units/*.tsx");

// 构建课程路由
const courseRoutes: JSX.Element[] = [];
for (const path in courseModules) {
    const match = path.match(/courses\/([^/]+)\/index\.tsx$/);
    if (match) {
        const courseId = match[1];
        const Component = lazy(courseModules[path] as any);
        courseRoutes.push(
            <Route key={courseId} path={`${courseId}`} element={<Component />} />
        );
    }
}
for (const path in unitModules) {
    const match = path.match(/courses\/([^/]+)\/units\/([^/]+)\.tsx$/);
    if (match) {
        const [_, courseId, unitId] = match;
        console.debug("unit:", courseId, unitId)
        const Component = lazy(unitModules[path] as any);
        courseRoutes.push(
            <Route key={`${courseId}-${unitId}`} path={`${courseId}/${unitId}`} element={<Component />} />
        );
    }
}


// 单独封装一个 CoursesWrapper 来渲染动态课程路由
const CoursesWrapper = () => {
    return (
        <Suspense fallback={<div>加载中...</div>}>
            <Routes>
                {courseRoutes}
            </Routes>
        </Suspense>
    );
}

export default CoursesWrapper;
