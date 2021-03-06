import { dasherize, decamelize, camelize, classify, underscore, group, capitalize, featurePath, pluralize } from './utility/strings';
export { findNodes, getSourceNodes, getDecoratorMetadata, getContentOfKeyLiteral, insertAfterLastOccurrence, insertImport, addBootstrapToModule, addDeclarationToModule, addExportToModule, addImportToModule, addProviderToModule, replaceImport, containsProperty, } from '../ng-g/utils/ast-utils';
export { Host, Change, NoopChange, InsertChange, RemoveChange, ReplaceChange, createReplaceChange, createChangeRecorder, commitChanges } from '../ng-g/utils/change';
export { AppConfig, getWorkspace, getWorkspacePath } from '../ng-g/utils/config';
export { findModule, findModuleFromOptions, buildRelativePath, ModuleOptions } from '../ng-g/utils/find-module';
export { getProjectPath, getProject, isLib } from './utility/project';
export declare const stringUtils: {
    dasherize: typeof dasherize;
    decamelize: typeof decamelize;
    camelize: typeof camelize;
    classify: typeof classify;
    underscore: typeof underscore;
    group: typeof group;
    capitalize: typeof capitalize;
    featurePath: typeof featurePath;
    pluralize: typeof pluralize;
};
export { parseName } from './utility/parse-name';
