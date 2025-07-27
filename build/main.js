var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// node_modules/@create-figma-plugin/utilities/lib/ui.js
function showUI(options, data) {
  if (typeof __html__ === "undefined") {
    throw new Error("No UI defined");
  }
  const html = `<div id="create-figma-plugin"></div><script>document.body.classList.add('theme-${figma.editorType}');const __FIGMA_COMMAND__='${typeof figma.command === "undefined" ? "" : figma.command}';const __SHOW_UI_DATA__=${JSON.stringify(typeof data === "undefined" ? {} : data)};${__html__}</script>`;
  figma.showUI(html, __spreadProps(__spreadValues({}, options), {
    themeColors: typeof options.themeColors === "undefined" ? true : options.themeColors
  }));
}
var init_ui = __esm({
  "node_modules/@create-figma-plugin/utilities/lib/ui.js"() {
  }
});

// node_modules/@create-figma-plugin/utilities/lib/index.js
var init_lib = __esm({
  "node_modules/@create-figma-plugin/utilities/lib/index.js"() {
    init_ui();
  }
});

// src/shared/constants.ts
var DEFAULT_WIDTH, DEFAULT_HEIGHT;
var init_constants = __esm({
  "src/shared/constants.ts"() {
    "use strict";
    DEFAULT_WIDTH = 800;
    DEFAULT_HEIGHT = 600;
  }
});

// src/main/errors.ts
function hasErrors(issues) {
  return issues.some((issue) => issue.level === "error");
}
var ERROR_CODES, ErrorHelpers;
var init_errors = __esm({
  "src/main/errors.ts"() {
    "use strict";
    ERROR_CODES = {
      // Selection errors
      NO_SELECTION: "NO_SELECTION",
      INVALID_SELECTION: "INVALID_SELECTION",
      UNSUPPORTED_NODE_TYPE: "UNSUPPORTED_NODE_TYPE",
      // Processing errors
      PROCESSING_FAILED: "PROCESSING_FAILED",
      INVALID_DATA: "INVALID_DATA",
      MISSING_PROPERTY: "MISSING_PROPERTY",
      // General errors
      UNKNOWN_ERROR: "UNKNOWN_ERROR",
      PERMISSION_DENIED: "PERMISSION_DENIED",
      NETWORK_ERROR: "NETWORK_ERROR"
    };
    ErrorHelpers = {
      /**
       * Returns an issue for when no selection is made in Figma.
       * @returns {Issue} Warning-level issue for no selection.
       */
      noSelection() {
        return {
          code: ERROR_CODES.NO_SELECTION,
          message: "Please select at least one object to continue",
          level: "warning"
        };
      },
      /**
       * Returns an error issue for invalid selection.
       * @param reason - Optional reason for invalid selection.
       * @returns {Issue} Error-level issue for invalid selection.
       */
      invalidSelection(reason) {
        return {
          code: ERROR_CODES.INVALID_SELECTION,
          message: reason ? "Invalid selection: " + reason : "The selected objects are not valid for this operation",
          level: "error"
        };
      },
      /**
       * Returns an error issue for unsupported node types.
       * @param nodeType - The unsupported node type.
       * @param nodeId - Optional node ID.
       * @returns {Issue} Error-level issue for unsupported node type.
       */
      unsupportedNodeType(nodeType, nodeId) {
        return {
          code: ERROR_CODES.UNSUPPORTED_NODE_TYPE,
          message: "Unsupported node type: " + nodeType + ". Please select a different object.",
          level: "error",
          nodeId
        };
      },
      /**
       * Returns an error issue for processing failures.
       * @param details - Optional details about the failure.
       * @returns {Issue} Error-level issue for processing failure.
       */
      processingFailed(details) {
        return {
          code: ERROR_CODES.PROCESSING_FAILED,
          message: details ? "Processing failed: " + details : "Processing failed due to an unexpected error",
          level: "error"
        };
      },
      /**
       * Returns an error issue for missing required properties.
       * @param propertyName - The missing property name.
       * @param nodeId - Optional node ID.
       * @returns {Issue} Error-level issue for missing property.
       */
      missingProperty(propertyName, nodeId) {
        return {
          code: ERROR_CODES.MISSING_PROPERTY,
          message: "Missing required property: " + propertyName,
          level: "error",
          nodeId
        };
      },
      /**
       * Returns an error issue for unknown errors.
       * @param error - The unknown error object.
       * @returns {Issue} Error-level issue for unknown error.
       */
      unknownError(error) {
        const message = error instanceof Error ? error.message : "An unknown error occurred";
        return {
          code: ERROR_CODES.UNKNOWN_ERROR,
          message: "Unexpected error: " + message,
          level: "error"
        };
      },
      /**
       * Returns an error issue for permission denied actions.
       * @param action - Optional action description.
       * @returns {Issue} Error-level issue for permission denied.
       */
      permissionDenied(action) {
        return {
          code: ERROR_CODES.PERMISSION_DENIED,
          message: action ? "Permission denied: " + action : "You do not have permission to perform this action",
          level: "error"
        };
      },
      // Success/info messages
      /**
       * Returns an info issue for successful operations.
       * @param message - Success message.
       * @returns {Issue} Info-level issue for success.
       */
      success(message) {
        return {
          code: "SUCCESS",
          message,
          level: "info"
        };
      },
      /**
       * Returns an info issue for informational messages.
       * @param message - Info message.
       * @returns {Issue} Info-level issue for info.
       */
      info(message) {
        return {
          code: "INFO",
          message,
          level: "info"
        };
      },
      /**
       * Returns a warning issue for warning messages.
       * @param message - Warning message.
       * @returns {Issue} Warning-level issue for warning.
       */
      warning(message) {
        return {
          code: "WARNING",
          message,
          level: "warning"
        };
      }
    };
  }
});

// src/main/index.ts
var main_exports = {};
__export(main_exports, {
  default: () => main_default
});
function main_default() {
  showUI({ height: DEFAULT_HEIGHT, width: DEFAULT_WIDTH });
  figma.ui.onmessage = async (msg) => {
    console.log("Main received message:", msg.type);
    if (msg.type === "SCAN") {
      figma.ui.postMessage({ type: "SCAN_PROGRESS", progress: 10 });
      const result = await performScan();
      figma.ui.postMessage({ type: "SCAN_PROGRESS", progress: 100 });
      figma.ui.postMessage({ type: "SCAN_RESULT", data: result });
    } else if (msg.type === "PROCESS") {
      try {
        const result = await performProcess(msg.data);
        figma.ui.postMessage({ type: "PROCESS_RESULT", data: result });
      } catch (error) {
        console.error("Process failed:", error);
        figma.ui.postMessage({
          type: "PROCESS_RESULT",
          data: {
            success: false,
            issues: [ErrorHelpers.unknownError(error)]
          }
        });
      }
    } else if (msg.type === "RESIZE") {
      figma.ui.resize(msg.width, msg.height);
    }
  };
}
async function performScan() {
  const selection = figma.currentPage.selection;
  const issues = [];
  if (selection.length === 0) {
    issues.push(ErrorHelpers.noSelection());
  }
  selection.forEach((node) => {
    if (node.type === "CONNECTOR") {
      issues.push(ErrorHelpers.unsupportedNodeType(node.type, node.id));
    }
  });
  const data = {
    selectionCount: selection.length,
    selectedTypes: selection.map((node) => node.type),
    pageInfo: {
      name: figma.currentPage.name,
      nodeCount: figma.currentPage.children.length
    }
  };
  return {
    success: !hasErrors(issues),
    data,
    issues,
    message: `Scanned ${selection.length} selected objects`
  };
}
async function performProcess(inputData) {
  const issues = [];
  await new Promise((resolve) => setTimeout(resolve, 500));
  const processedData = {
    processed: true,
    timestamp: Date.now(),
    input: inputData
  };
  return {
    success: true,
    data: processedData,
    issues,
    message: "Processing completed successfully"
  };
}
var init_main = __esm({
  "src/main/index.ts"() {
    "use strict";
    init_lib();
    init_constants();
    init_errors();
  }
});

// <stdin>
var modules = { "src/main/index.ts--default": (init_main(), __toCommonJS(main_exports))["default"] };
var commandId = true ? "src/main/index.ts--default" : figma.command;
modules[commandId]();
