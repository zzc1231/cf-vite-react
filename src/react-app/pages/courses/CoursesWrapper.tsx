import { JSX, lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";


// === 动态导入所有课程模块 ===
export const courseModules = import.meta.glob("@/pages/courses/*/index.tsx");
export const unitModules = import.meta.glob("@/pages/courses/*/units/*.tsx");

// 构建课程路由
const courseRoutes: JSX.Element[] = [];
for (const path in courseModules) {
    const match = path.match(/courses\/([^/]+)\/index\.tsx$/);
    if (match) {
        const courseName = match[1];
        const loader = courseModules[path] as () => Promise<any>;

        // React.lazy 包装
        const Component = lazy(() =>
            loader().then(mod => {
                console.debug("lazy course:", courseName, mod)
                // 首次加载模块后赋值 meta
                if (mod.meta) {
                    mod.meta.courseName = courseName;
                }
                return mod;
            })
        );
        courseRoutes.push(
            <Route key={courseName} path={`${courseName}`} element={<Component />} />
        );


    }
}
for (const path in unitModules) {
    const match = path.match(/courses\/([^/]+)\/units\/([^/]+)\.tsx$/);
    if (match) {
        const [_, courseName, unitName] = match;
        console.debug("unit:", courseName, unitName)

        const Component = lazy(() =>
            unitModules[path]().then(mod => {

                console.debug("lazy unit:", courseName, unitName, mod)
                const typedMod = mod as any;
                if (typedMod.meta) {
                    typedMod.meta.courseName = courseName;
                    typedMod.meta.unitName = unitName;
                }
                return typedMod;
            }) as Promise<{ default: React.ComponentType<any> }>
        );

        courseRoutes.push(
            <Route key={`${courseName}-${unitName}`} path={`${courseName}/${unitName}`} element={<Component />} />
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
