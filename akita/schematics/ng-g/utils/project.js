"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isWorkspaceSchema = exports.getProject = exports.getProjectPath = void 0;
const schematics_utilities_1 = require("schematics-utilities");
function getProjectPath(host, options) {
    const workspace = (0, schematics_utilities_1.getWorkspace)(host);
    if (!options.project) {
        options.project = Object.keys(workspace.projects)[0];
    }
    const project = workspace.projects[options.project];
    if (project.root.substr(-1) === '/') {
        project.root = project.root.substr(0, project.root.length - 1);
    }
    if (options.path === undefined) {
        const projectDirName = project.projectType === 'application' ? 'app' : 'lib';
        const root = project.sourceRoot ? `/${project.sourceRoot}/` : `/${project.root}/src/`;
        return `${root}${projectDirName}`;
    }
    return options.path;
}
exports.getProjectPath = getProjectPath;
function getProject(workspaceOrHost, projectName) {
    const workspace = isWorkspaceSchema(workspaceOrHost) ? workspaceOrHost : (0, schematics_utilities_1.getWorkspace)(workspaceOrHost);
    return workspace.projects[projectName];
}
exports.getProject = getProject;
function isWorkspaceSchema(workspace) {
    return !!(workspace && workspace.projects);
}
exports.isWorkspaceSchema = isWorkspaceSchema;
//# sourceMappingURL=project.js.map