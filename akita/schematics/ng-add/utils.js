"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.applyChanges = exports.getModuleFile = exports.isImported = exports.addEntryComponentToModule = exports.addBootstrapToModule = exports.addExportToModule = exports.addProviderToModule = exports.addImportToModule = exports.addDeclarationToModule = exports.addSymbolToNgModuleMetadata = exports.getFirstNgModuleName = exports.getDecoratorMetadata = exports.getContentOfKeyLiteral = exports.insertAfterLastOccurrence = exports.findNode = exports.getSourceNodes = exports.findNodes = exports.insertImport = exports.ReplaceChange = exports.RemoveChange = exports.InsertChange = exports.NoopChange = void 0;
const ts = require("typescript");
const schematics_1 = require("@angular-devkit/schematics");
/**
 * An operation that does nothing.
 */
class NoopChange {
    constructor() {
        this.description = 'No operation.';
        this.order = Infinity;
        this.path = null;
    }
    apply() {
        return Promise.resolve();
    }
}
exports.NoopChange = NoopChange;
/**
 * Will add text to the source code.
 */
class InsertChange {
    constructor(path, pos, toAdd) {
        this.path = path;
        this.pos = pos;
        this.toAdd = toAdd;
        if (pos < 0) {
            throw new Error('Negative positions are invalid');
        }
        this.description = `Inserted ${toAdd} into position ${pos} of ${path}`;
        this.order = pos;
    }
    /**
     * This method does not insert spaces if there is none in the original string.
     */
    apply(host) {
        return host.read(this.path).then(content => {
            const prefix = content.substring(0, this.pos);
            const suffix = content.substring(this.pos);
            return host.write(this.path, `${prefix}${this.toAdd}${suffix}`);
        });
    }
}
exports.InsertChange = InsertChange;
/**
 * Will remove text from the source code.
 */
class RemoveChange {
    constructor(path, pos, toRemove) {
        this.path = path;
        this.pos = pos;
        this.toRemove = toRemove;
        if (pos < 0) {
            throw new Error('Negative positions are invalid');
        }
        this.description = `Removed ${toRemove} into position ${pos} of ${path}`;
        this.order = pos;
    }
    apply(host) {
        return host.read(this.path).then(content => {
            const prefix = content.substring(0, this.pos);
            const suffix = content.substring(this.pos + this.toRemove.length);
            // TODO: throw error if toRemove doesn't match removed string.
            return host.write(this.path, `${prefix}${suffix}`);
        });
    }
}
exports.RemoveChange = RemoveChange;
/**
 * Will replace text from the source code.
 */
class ReplaceChange {
    constructor(path, pos, oldText, newText) {
        this.path = path;
        this.pos = pos;
        this.oldText = oldText;
        this.newText = newText;
        if (pos < 0) {
            throw new Error('Negative positions are invalid');
        }
        this.description = `Replaced ${oldText} into position ${pos} of ${path} with ${newText}`;
        this.order = pos;
    }
    apply(host) {
        return host.read(this.path).then(content => {
            const prefix = content.substring(0, this.pos);
            const suffix = content.substring(this.pos + this.oldText.length);
            const text = content.substring(this.pos, this.pos + this.oldText.length);
            if (text !== this.oldText) {
                return Promise.reject(new Error(`Invalid replace: "${text}" != "${this.oldText}".`));
            }
            // TODO: throw error if oldText doesn't match removed string.
            return host.write(this.path, `${prefix}${this.newText}${suffix}`);
        });
    }
}
exports.ReplaceChange = ReplaceChange;
function insertImport(source, fileToEdit, symbolName, fileName, isDefault = false) {
    const rootNode = source;
    const allImports = findNodes(rootNode, ts.SyntaxKind.ImportDeclaration);
    // get nodes that map to import statements from the file fileName
    const relevantImports = allImports.filter(node => {
        // StringLiteral of the ImportDeclaration is the import file (fileName in this case).
        const importFiles = node
            .getChildren()
            .filter(child => child.kind === ts.SyntaxKind.StringLiteral)
            .map(n => n.text);
        return importFiles.filter(file => file === fileName).length === 1;
    });
    if (relevantImports.length > 0) {
        let importsAsterisk = false;
        // imports from import file
        const imports = [];
        relevantImports.forEach(n => {
            Array.prototype.push.apply(imports, findNodes(n, ts.SyntaxKind.Identifier));
            if (findNodes(n, ts.SyntaxKind.AsteriskToken).length > 0) {
                importsAsterisk = true;
            }
        });
        // if imports * from fileName, don't add symbolName
        if (importsAsterisk) {
            return new NoopChange();
        }
        const importTextNodes = imports.filter(n => n.text === symbolName);
        // insert import if it's not there
        if (importTextNodes.length === 0) {
            const fallbackPos = findNodes(relevantImports[0], ts.SyntaxKind.CloseBraceToken)[0].getStart() || findNodes(relevantImports[0], ts.SyntaxKind.FromKeyword)[0].getStart();
            return insertAfterLastOccurrence(imports, `, ${symbolName}`, fileToEdit, fallbackPos);
        }
        return new NoopChange();
    }
    // no such import declaration exists
    const useStrict = findNodes(rootNode, ts.SyntaxKind.StringLiteral).filter((n) => n.text === 'use strict');
    let fallbackPos = 0;
    if (useStrict.length > 0) {
        fallbackPos = useStrict[0].end;
    }
    const open = isDefault ? '' : '{ ';
    const close = isDefault ? '' : ' }';
    // if there are no imports or 'use strict' statement, insert import at beginning of file
    const insertAtBeginning = allImports.length === 0 && useStrict.length === 0;
    const separator = insertAtBeginning ? '' : ';\n';
    const toInsert = `${separator}import ${open}${symbolName}${close}` + ` from '${fileName}'${insertAtBeginning ? ';\n' : ''}`;
    return insertAfterLastOccurrence(allImports, toInsert, fileToEdit, fallbackPos, ts.SyntaxKind.StringLiteral);
}
exports.insertImport = insertImport;
/**
 * Find all nodes from the AST in the subtree of node of SyntaxKind kind.
 * @param node
 * @param kind
 * @param max The maximum number of items to return.
 * @return all nodes of kind, or [] if none is found
 */
function findNodes(node, kind, max = Infinity) {
    if (!node || max == 0) {
        return [];
    }
    const arr = [];
    if (node.kind === kind) {
        arr.push(node);
        max--;
    }
    if (max > 0) {
        for (const child of node.getChildren()) {
            findNodes(child, kind, max).forEach(node => {
                if (max > 0) {
                    arr.push(node);
                }
                max--;
            });
            if (max <= 0) {
                break;
            }
        }
    }
    return arr;
}
exports.findNodes = findNodes;
/**
 * Get all the nodes from a source.
 * @param sourceFile The source file object.
 * @returns {Observable<ts.Node>} An observable of all the nodes in the source.
 */
function getSourceNodes(sourceFile) {
    const nodes = [sourceFile];
    const result = [];
    while (nodes.length > 0) {
        const node = nodes.shift();
        if (node) {
            result.push(node);
            if (node.getChildCount(sourceFile) >= 0) {
                nodes.unshift(...node.getChildren());
            }
        }
    }
    return result;
}
exports.getSourceNodes = getSourceNodes;
function findNode(node, kind, text) {
    if (node.kind === kind && node.getText() === text) {
        // throw new Error(node.getText());
        return node;
    }
    let foundNode = null;
    ts.forEachChild(node, childNode => {
        foundNode = foundNode || findNode(childNode, kind, text);
    });
    return foundNode;
}
exports.findNode = findNode;
/**
 * Helper for sorting nodes.
 * @return function to sort nodes in increasing order of position in sourceFile
 */
function nodesByPosition(first, second) {
    return first.getStart() - second.getStart();
}
/**
 * Insert `toInsert` after the last occurence of `ts.SyntaxKind[nodes[i].kind]`
 * or after the last of occurence of `syntaxKind` if the last occurence is a sub child
 * of ts.SyntaxKind[nodes[i].kind] and save the changes in file.
 *
 * @param nodes insert after the last occurence of nodes
 * @param toInsert string to insert
 * @param file file to insert changes into
 * @param fallbackPos position to insert if toInsert happens to be the first occurence
 * @param syntaxKind the ts.SyntaxKind of the subchildren to insert after
 * @return Change instance
 * @throw Error if toInsert is first occurence but fall back is not set
 */
function insertAfterLastOccurrence(nodes, toInsert, file, fallbackPos, syntaxKind) {
    // sort() has a side effect, so make a copy so that we won't overwrite the parent's object.
    let lastItem = [...nodes].sort(nodesByPosition).pop();
    if (!lastItem) {
        throw new Error();
    }
    if (syntaxKind) {
        lastItem = findNodes(lastItem, syntaxKind)
            .sort(nodesByPosition)
            .pop();
    }
    if (!lastItem && fallbackPos == undefined) {
        throw new Error(`tried to insert ${toInsert} as first occurence with no fallback position`);
    }
    const lastItemPosition = lastItem ? lastItem.getEnd() : fallbackPos;
    return new InsertChange(file, lastItemPosition, toInsert);
}
exports.insertAfterLastOccurrence = insertAfterLastOccurrence;
function getContentOfKeyLiteral(_source, node) {
    if (node.kind == ts.SyntaxKind.Identifier) {
        return node.text;
    }
    else if (node.kind == ts.SyntaxKind.StringLiteral) {
        return node.text;
    }
    else {
        return null;
    }
}
exports.getContentOfKeyLiteral = getContentOfKeyLiteral;
function _angularImportsFromNode(node, _sourceFile) {
    const ms = node.moduleSpecifier;
    let modulePath;
    switch (ms.kind) {
        case ts.SyntaxKind.StringLiteral:
            modulePath = ms.text;
            break;
        default:
            return {};
    }
    if (!modulePath.startsWith('@angular/')) {
        return {};
    }
    if (node.importClause) {
        if (node.importClause.name) {
            // This is of the form `import Name from 'path'`. Ignore.
            return {};
        }
        else if (node.importClause.namedBindings) {
            const nb = node.importClause.namedBindings;
            if (nb.kind == ts.SyntaxKind.NamespaceImport) {
                // This is of the form `import * as name from 'path'`. Return `name.`.
                return {
                    [nb.name.text + '.']: modulePath
                };
            }
            else {
                // This is of the form `import {a,b,c} from 'path'`
                const namedImports = nb;
                return namedImports.elements
                    .map((is) => (is.propertyName ? is.propertyName.text : is.name.text))
                    .reduce((acc, curr) => {
                    acc[curr] = modulePath;
                    return acc;
                }, {});
            }
        }
        return {};
    }
    else {
        // This is of the form `import 'path';`. Nothing to do.
        return {};
    }
}
function getDecoratorMetadata(source, identifier, module) {
    const angularImports = findNodes(source, ts.SyntaxKind.ImportDeclaration)
        .map((node) => _angularImportsFromNode(node, source))
        .reduce((acc, current) => {
        for (const key of Object.keys(current)) {
            acc[key] = current[key];
        }
        return acc;
    }, {});
    return getSourceNodes(source)
        .filter(node => {
        return node.kind == ts.SyntaxKind.Decorator && node.expression.kind == ts.SyntaxKind.CallExpression;
    })
        .map(node => node.expression)
        .filter(expr => {
        if (expr.expression.kind == ts.SyntaxKind.Identifier) {
            const id = expr.expression;
            return id.getFullText(source) == identifier && angularImports[id.getFullText(source)] === module;
        }
        else if (expr.expression.kind == ts.SyntaxKind.PropertyAccessExpression) {
            // This covers foo.NgModule when importing * as foo.
            const paExpr = expr.expression;
            // If the left expression is not an identifier, just give up at that point.
            if (paExpr.expression.kind !== ts.SyntaxKind.Identifier) {
                return false;
            }
            const id = paExpr.name.text;
            const moduleId = paExpr.expression.getText(source);
            return id === identifier && angularImports[moduleId + '.'] === module;
        }
        return false;
    })
        .filter(expr => expr.arguments[0] && expr.arguments[0].kind == ts.SyntaxKind.ObjectLiteralExpression)
        .map(expr => expr.arguments[0]);
}
exports.getDecoratorMetadata = getDecoratorMetadata;
function findClassDeclarationParent(node) {
    if (ts.isClassDeclaration(node)) {
        return node;
    }
    return node.parent && findClassDeclarationParent(node.parent);
}
/**
 * Given a source file with @NgModule class(es), find the name of the first @NgModule class.
 *
 * @param source source file containing one or more @NgModule
 * @returns the name of the first @NgModule, or `undefined` if none is found
 */
function getFirstNgModuleName(source) {
    // First, find the @NgModule decorators.
    const ngModulesMetadata = getDecoratorMetadata(source, 'NgModule', '@angular/core');
    if (ngModulesMetadata.length === 0) {
        return undefined;
    }
    // Then walk parent pointers up the AST, looking for the ClassDeclaration parent of the NgModule
    // metadata.
    const moduleClass = findClassDeclarationParent(ngModulesMetadata[0]);
    if (!moduleClass || !moduleClass.name) {
        return undefined;
    }
    // Get the class name of the module ClassDeclaration.
    return moduleClass.name.text;
}
exports.getFirstNgModuleName = getFirstNgModuleName;
function addSymbolToNgModuleMetadata(source, ngModulePath, metadataField, symbolName, importPath = null, skipImport = true) {
    const nodes = getDecoratorMetadata(source, 'NgModule', '@angular/core');
    let node = nodes[0]; // tslint:disable-line:no-any
    // Find the decorator declaration.
    if (!node) {
        return [];
    }
    // Get all the children property assignment of object literals.
    const matchingProperties = node.properties
        .filter(prop => prop.kind == ts.SyntaxKind.PropertyAssignment)
        // Filter out every fields that's not "metadataField". Also handles string literals
        // (but not expressions).
        .filter((prop) => {
        const name = prop.name;
        switch (name.kind) {
            case ts.SyntaxKind.Identifier:
                return name.getText(source) == metadataField;
            case ts.SyntaxKind.StringLiteral:
                return name.text == metadataField;
        }
        return false;
    });
    // Get the last node of the array literal.
    if (!matchingProperties) {
        return [];
    }
    if (matchingProperties.length == 0) {
        // We haven't found the field in the metadata declaration. Insert a new field.
        const expr = node;
        let position;
        let toInsert;
        if (expr.properties.length == 0) {
            position = expr.getEnd() - 1;
            toInsert = `  ${metadataField}: [${symbolName}]\n`;
        }
        else {
            node = expr.properties[expr.properties.length - 1];
            position = node.getEnd();
            // Get the indentation of the last element, if any.
            const text = node.getFullText(source);
            const matches = text.match(/^\r?\n\s*/);
            if (matches && matches.length > 0) {
                toInsert = `,${matches[0]}${metadataField}: [${symbolName}]`;
            }
            else {
                toInsert = `, ${metadataField}: [${symbolName}]`;
            }
        }
        if (importPath !== null) {
            return [
                new InsertChange(ngModulePath, position, toInsert)
                // insertImport(source, ngModulePath, symbolName.replace(/\..*$/, ''), importPath)
            ];
        }
        else {
            return [new InsertChange(ngModulePath, position, toInsert)];
        }
    }
    const assignment = matchingProperties[0];
    // If it's not an array, nothing we can do really.
    if (assignment.initializer.kind !== ts.SyntaxKind.ArrayLiteralExpression) {
        return [];
    }
    const arrLiteral = assignment.initializer;
    if (arrLiteral.elements.length == 0) {
        // Forward the property.
        node = arrLiteral;
    }
    else {
        node = arrLiteral.elements;
    }
    if (!node) {
        console.error('No app module found. Please add your new class to your component.');
        return [];
    }
    if (Array.isArray(node)) {
        const nodeArray = node;
        const symbolsArray = nodeArray.map(node => node.getText());
        if (symbolsArray.includes(symbolName)) {
            return [];
        }
        node = node[node.length - 1];
    }
    let toInsert;
    let position = node.getEnd();
    if (node.kind == ts.SyntaxKind.ObjectLiteralExpression) {
        // We haven't found the field in the metadata declaration. Insert a new
        // field.
        const expr = node;
        if (expr.properties.length == 0) {
            position = expr.getEnd() - 1;
            toInsert = `  ${symbolName}\n`;
        }
        else {
            // Get the indentation of the last element, if any.
            const text = node.getFullText(source);
            if (text.match(/^\r?\r?\n/)) {
                toInsert = `,${text.match(/^\r?\n\s*/)[0]}${symbolName}`;
            }
            else {
                toInsert = `, ${symbolName}`;
            }
        }
    }
    else if (node.kind == ts.SyntaxKind.ArrayLiteralExpression) {
        // We found the field but it's empty. Insert it just before the `]`.
        position--;
        toInsert = `${symbolName}`;
    }
    else {
        // Get the indentation of the last element, if any.
        const text = node.getFullText(source);
        if (text.match(/^\r?\n/)) {
            toInsert = `,${text.match(/^\r?\n(\r?)\s*/)[0]}${symbolName}`;
        }
        else {
            toInsert = `, ${symbolName}`;
        }
    }
    if (importPath !== null) {
        return [new InsertChange(ngModulePath, position, toInsert), skipImport ? new NoopChange() : insertImport(source, ngModulePath, symbolName.replace(/\..*$/, ''), importPath)];
    }
    return [new InsertChange(ngModulePath, position, toInsert)];
}
exports.addSymbolToNgModuleMetadata = addSymbolToNgModuleMetadata;
/**
 * Custom function to insert a declaration (component, pipe, directive)
 * into NgModule declarations. It also imports the component.
 */
function addDeclarationToModule(source, modulePath, classifiedName, importPath) {
    return addSymbolToNgModuleMetadata(source, modulePath, 'declarations', classifiedName, importPath);
}
exports.addDeclarationToModule = addDeclarationToModule;
/**
 * Custom function to insert an NgModule into NgModule imports. It also imports the module.
 */
function addImportToModule(source, modulePath, classifiedName, importPath) {
    return addSymbolToNgModuleMetadata(source, modulePath, 'imports', classifiedName, importPath);
}
exports.addImportToModule = addImportToModule;
/**
 * Custom function to insert a provider into NgModule. It also imports it.
 */
function addProviderToModule(source, modulePath, classifiedName, importPath) {
    return addSymbolToNgModuleMetadata(source, modulePath, 'providers', classifiedName, importPath);
}
exports.addProviderToModule = addProviderToModule;
/**
 * Custom function to insert an export into NgModule. It also imports it.
 */
function addExportToModule(source, modulePath, classifiedName, importPath) {
    return addSymbolToNgModuleMetadata(source, modulePath, 'exports', classifiedName, importPath);
}
exports.addExportToModule = addExportToModule;
/**
 * Custom function to insert an export into NgModule. It also imports it.
 */
function addBootstrapToModule(source, modulePath, classifiedName, importPath) {
    return addSymbolToNgModuleMetadata(source, modulePath, 'bootstrap', classifiedName, importPath);
}
exports.addBootstrapToModule = addBootstrapToModule;
/**
 * Custom function to insert an entryComponent into NgModule. It also imports it.
 */
function addEntryComponentToModule(source, modulePath, classifiedName, importPath) {
    return addSymbolToNgModuleMetadata(source, modulePath, 'entryComponents', classifiedName, importPath);
}
exports.addEntryComponentToModule = addEntryComponentToModule;
/**
 * Determine if an import already exists.
 */
function isImported(source, classifiedName, importPath) {
    const allNodes = getSourceNodes(source);
    const matchingNodes = allNodes
        .filter(node => node.kind === ts.SyntaxKind.ImportDeclaration)
        .filter((imp) => imp.moduleSpecifier.kind === ts.SyntaxKind.StringLiteral)
        .filter((imp) => {
        return imp.moduleSpecifier.text === importPath;
    })
        .filter((imp) => {
        if (!imp.importClause) {
            return false;
        }
        const nodes = findNodes(imp.importClause, ts.SyntaxKind.ImportSpecifier).filter(n => n.getText() === classifiedName);
        return nodes.length > 0;
    });
    return matchingNodes.length > 0;
}
exports.isImported = isImported;
function getModuleFile(host, modulePath) {
    if (!host.exists(modulePath)) {
        throw new schematics_1.SchematicsException(`File ${modulePath} does not exist.`);
    }
    const text = host.read(modulePath);
    if (text === null) {
        throw new schematics_1.SchematicsException(`File ${modulePath} does not exist.`);
    }
    const sourceText = text.toString('utf-8');
    return ts.createSourceFile(modulePath, sourceText, ts.ScriptTarget.Latest, true);
}
exports.getModuleFile = getModuleFile;
function applyChanges(host, path, changes) {
    const recorder = host.beginUpdate(path);
    for (const change of changes) {
        if (change instanceof InsertChange) {
            recorder.insertLeft(change.pos, change.toAdd);
        }
    }
    host.commitUpdate(recorder);
    return host;
}
exports.applyChanges = applyChanges;
//# sourceMappingURL=utils.js.map