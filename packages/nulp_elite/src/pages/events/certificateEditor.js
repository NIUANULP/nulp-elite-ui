import React, { useEffect, useRef, useState } from "react";
import Header from "components/header";
import Footer from "components/Footer";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import InputLabel from "@mui/material/InputLabel";
import FormControl from "@mui/material/FormControl";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Divider from "@mui/material/Divider";
import Alert from "@mui/material/Alert";
import Stack from "@mui/material/Stack";
import Switch from "@mui/material/Switch";
import FormControlLabel from "@mui/material/FormControlLabel";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Snackbar from "@mui/material/Snackbar";
import TitleIcon from "@mui/icons-material/Title";
import AddPhotoAlternateOutlinedIcon from "@mui/icons-material/AddPhotoAlternateOutlined";
import EditNoteIcon from "@mui/icons-material/EditNote";
import LinkIcon from "@mui/icons-material/Link";
import DownloadIcon from "@mui/icons-material/Download";
import UndoIcon from "@mui/icons-material/Undo";
import RedoIcon from "@mui/icons-material/Redo";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import WorkspacePremiumOutlinedIcon from "@mui/icons-material/WorkspacePremiumOutlined";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import CloseIcon from "@mui/icons-material/Close";
import PhotoLibraryOutlinedIcon from "@mui/icons-material/PhotoLibraryOutlined";
import ContentCutIcon from "@mui/icons-material/ContentCut";
import axios from "axios";
import Unauthorized from "../Unauthorized";

const urlConfig = require("../../configs/urlConfig.json");

const ADMIN_ROLES = new Set(["SYSTEM_ADMINISTRATION"]);

let uidCounter = 100;

const mulMat = (A, B) => [
  A[0] * B[0] + A[2] * B[1],
  A[1] * B[0] + A[3] * B[1],
  A[0] * B[2] + A[2] * B[3],
  A[1] * B[2] + A[3] * B[3],
  A[0] * B[4] + A[2] * B[5] + A[4],
  A[1] * B[4] + A[3] * B[5] + A[5],
];

const transformToMatrix = (transform) => {
  if (!transform) return [1, 0, 0, 1, 0, 0];
  let m = [1, 0, 0, 1, 0, 0];
  const re = /([a-zA-Z]+)\(([^)]*)\)/g;
  let mm;
  while ((mm = re.exec(transform))) {
    const name = mm[1];
    const args = mm[2]
      .trim()
      .split(/[\s,]+/)
      .filter(Boolean)
      .map(Number);
    let tok = [1, 0, 0, 1, 0, 0];
    if (name === "translate") {
      tok = [1, 0, 0, 1, args[0] || 0, args[1] || 0];
    } else if (name === "scale") {
      const sx = args[0] || 1;
      const sy = args[1] ?? sx;
      tok = [sx, 0, 0, sy, 0, 0];
    } else if (name === "matrix") {
      tok = [
        args[0] || 1,
        args[1] || 0,
        args[2] || 0,
        args[3] || 1,
        args[4] || 0,
        args[5] || 0,
      ];
    } else if (name === "rotate") {
      const a = ((args[0] || 0) * Math.PI) / 180;
      const c = Math.cos(a);
      const s = Math.sin(a);
      const r = [c, s, -s, c, 0, 0];
      if (args.length >= 3) {
        const cx = args[1];
        const cy = args[2];
        tok = mulMat([1, 0, 0, 1, cx, cy], mulMat(r, [1, 0, 0, 1, -cx, -cy]));
      } else {
        tok = r;
      }
    }
    m = mulMat(tok, m);
  }
  return m;
};

const absMatrixOf = (node) => {
  let m = transformToMatrix(node.getAttribute("transform"));
  for (
    let n = node.parentNode;
    n?.tagName?.toLowerCase() !== "svg";
    n = n?.parentNode
  ) {
    const mm = transformToMatrix(n.getAttribute("transform"));
    m = mulMat(mm, m);
  }
  return m;
};

const ancestorsMatrixOf = (node) => {
  let m = [1, 0, 0, 1, 0, 0];
  for (
    let n = node.parentNode;
    n?.tagName?.toLowerCase() !== "svg";
    n = n?.parentNode
  ) {
    m = mulMat(transformToMatrix(n.getAttribute("transform")), m);
  }
  return m;
};

const invMat = (m) => {
  const [a, b, c, d, e, f] = m;
  const det = a * d - c * b;
  if (Math.abs(det) < 1e-9) return [1, 0, 0, 1, 0, 0];
  return [
    d / det,
    -b / det,
    -c / det,
    a / det,
    (c * f - d * e) / det,
    (b * e - a * f) / det,
  ];
};

const isIdentity = (m) =>
  Math.abs(m[0] - 1) < 1e-6 &&
  Math.abs(m[1]) < 1e-6 &&
  Math.abs(m[2]) < 1e-6 &&
  Math.abs(m[3] - 1) < 1e-6 &&
  Math.abs(m[4]) < 1e-6 &&
  Math.abs(m[5]) < 1e-6;

const setElementTransform = (node, m) => {
  if (isIdentity(m)) node.removeAttribute("transform");
  else
    node.setAttribute(
      "transform",
      `matrix(${m[0]} ${m[1]} ${m[2]} ${m[3]} ${m[4]} ${m[5]})`
    );
};

// Move a node under `g` without shifting anything on the canvas: the node's
// absolute placement is recomputed relative to the group, folding a pure
// translation back into x/y so the element keeps its usual attribute layout.
const reparentInto = (g, node) => {
  const absBefore = absMatrixOf(node);
  g.appendChild(node);
  const rel = mulMat(invMat(absMatrixOf(g)), absBefore);
  const pure =
    Math.abs(rel[0] - 1) < 1e-6 &&
    Math.abs(rel[1]) < 1e-6 &&
    Math.abs(rel[2]) < 1e-6 &&
    Math.abs(rel[3] - 1) < 1e-6;
  if (pure && (node.hasAttribute("x") || node.hasAttribute("y"))) {
    node.setAttribute(
      "x",
      Number.parseFloat(node.getAttribute("x") || 0) + rel[4]
    );
    node.setAttribute(
      "y",
      Number.parseFloat(node.getAttribute("y") || 0) + rel[5]
    );
    node.removeAttribute("transform");
  } else {
    setElementTransform(node, rel);
  }
};

const isPureTranslation = (m) =>
  Math.abs(m[0] - 1) < 1e-6 &&
  Math.abs(m[1]) < 1e-6 &&
  Math.abs(m[2]) < 1e-6 &&
  Math.abs(m[3] - 1) < 1e-6;

const SHAPE_TAGS = [
  "rect",
  "line",
  "path",
  "circle",
  "ellipse",
  "polygon",
  "polyline",
];

const SHAPE_LABELS = {
  rect: "Rectangle",
  line: "Line",
  path: "Path",
  circle: "Circle",
  ellipse: "Ellipse",
  polygon: "Polygon",
  polyline: "Polyline",
};

const isShapeTag = (t) => SHAPE_TAGS.includes(t);

const cornersBBox = (corners, m) => {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  corners.forEach((p) => {
    const q = {
      x: m[0] * p[0] + m[2] * p[1] + m[4],
      y: m[1] * p[0] + m[3] * p[1] + m[5],
    };
    minX = Math.min(minX, q.x);
    minY = Math.min(minY, q.y);
    maxX = Math.max(maxX, q.x);
    maxY = Math.max(maxY, q.y);
  });
  return { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
};

const decodeSvg = (str) => {
  if (str?.startsWith("data:")) {
    const comma = str.indexOf(",");
    const meta = str.slice(5, comma);
    const data = str.slice(comma + 1);
    if (meta.includes("base64")) {
      try {
        return new TextDecoder().decode(
          Uint8Array.from(atob(data), (c) => c.charCodeAt(0))
        );
      } catch (e) {
        return atob(data);
      }
    }
    return decodeURIComponent(data);
  }
  return str;
};

// Nodes that never paint anything. They must not be given a baked transform:
// moving a <defs> shifts any gradient/pattern inside it, which repaints every
// element that references it.
const NON_RENDERING_TAGS = new Set([
  "defs",
  "style",
  "script",
  "title",
  "desc",
  "metadata",
  "symbol",
  "marker",
  "filter",
  "clipPath",
  "mask",
  "pattern",
]);

// The same containers, as a selector: elements below them are never painted on
// their own (a <rect> inside a <clipPath> only shapes other elements), so they
// must not show up as editable parts of the certificate.
const NON_RENDERING_SELECTOR =
  "defs, clipPath, mask, pattern, marker, filter, symbol";

// Some templates flatten whole vector graphics into a single base64 <image>
// (e.g. the "frameset" picture in the CITIIS template, which holds 26 paths).
// Those parts can never be selected individually, so the embedded SVG is
// inlined into the document and every shape inside becomes editable.
const expandEmbeddedSvgs = (svg) => {
  const ns = "http://www.w3.org/2000/svg";
  const candidates = Array.from(svg.querySelectorAll("image")).filter((img) => {
    if (img.closest("defs")) return false;
    const href =
      img.getAttribute("href") || img.getAttribute("xlink:href") || "";
    return (
      /^\s*data:image\/svg\+xml/i.test(href) || /^\s*<svg[\s>]/i.test(href)
    );
  });

  const num = (v, fallback) => {
    const n = Number.parseFloat(v);
    return Number.isFinite(n) ? n : fallback;
  };

  let expanded = 0;
  // NOSONAR
  candidates.forEach((img) => {
    const href =
      img.getAttribute("href") || img.getAttribute("xlink:href") || "";
    let text = "";
    try {
      text = decodeSvg(href.trim());
    } catch (e) {
      return;
    }
    if (!/<svg[\s>]/i.test(text)) return;
    const parsed = new DOMParser().parseFromString(text, "image/svg+xml");
    if (parsed.querySelector("parsererror")) return;
    const inner = parsed.documentElement;
    if (!inner || inner.nodeName.toLowerCase() !== "svg") return;

    // Resolve the placement box, resolving percentages against the canvas.
    const vb = parseViewBox(svg);
    const boxX = num(img.getAttribute("x"), 0);
    const boxY = num(img.getAttribute("y"), 0);
    const pctBase = (attr, base) => {
      const raw = img.getAttribute(attr);
      if (raw == null) return base;
      if (String(raw).trim().endsWith("%")) {
        return (Number.parseFloat(raw) / 100) * base;
      }
      return num(raw, base);
    };
    const boxW = pctBase("width", vb.w);
    const boxH = pctBase("height", vb.h);

    // Map the inner viewBox onto that box.
    const ivb = parseViewBox(inner);
    const hasViewBox = inner.hasAttribute("viewBox");
    const sx = hasViewBox && ivb.w ? boxW / ivb.w : 1;
    const sy = hasViewBox && ivb.h ? boxH / ivb.h : 1;
    const tx = boxX - (hasViewBox ? ivb.x * sx : 0);
    const ty = boxY - (hasViewBox ? ivb.y * sy : 0);

    const g = svg.ownerDocument.createElementNS(ns, "g");
    g.setAttribute("transform", `translate(${tx} ${ty}) scale(${sx} ${sy})`);
    if (inner.getAttribute("class"))
      g.setAttribute("class", inner.getAttribute("class"));
    // Move every child so ids, gradients and class rules keep working, but
    // keep the non-painting ones outside the transform: a shifted <defs> would
    // move the gradients and patterns its siblings reference. They are
    // inserted next to the <image> itself (not next to the root <svg>), since
    // the image may sit inside a nested <g> and insertBefore only accepts a
    // node that is a child of the target parent.
    while (inner.firstChild) {
      const child = inner.firstChild;
      const tag = child.nodeType === 1 ? child.nodeName : "";
      if (NON_RENDERING_TAGS.has(tag)) {
        img.before(child);
      } else {
        g.appendChild(child);
      }
    }
    img.replaceWith(g);
    expanded++;
  });
  return expanded;
};

const readTextRect = (el) => {
  const fontSize = Number.parseFloat(
    el.getAttribute("font-size") || el.style?.fontSize || 24
  );
  const anchor = el.getAttribute("text-anchor") || "start";
  const text = el.textContent || "";
  const w = Math.max(text.length * fontSize * 0.55, 10);
  const h = fontSize * 1.3;
  const baseX = Number.parseFloat(el.getAttribute("x") || 0);
  const baseY = Number.parseFloat(el.getAttribute("y") || 0);
  let left = baseX;
  if (anchor === "middle") {
    left = baseX - w / 2;
  } else if (anchor === "end") {
    left = baseX - w;
  }
  return {
    x: left,
    y: baseY - fontSize * 0.95,
    w,
    h,
    baseX,
    baseY,
  };
};

const attrNum = (el, name, fallback = 0) => {
  const v = Number.parseFloat(el.getAttribute(name));
  return Number.isFinite(v) ? v : fallback;
};

// Bounds of a shape in its own user space. The basic shapes are read straight
// from their geometry (exact, and it does not depend on layout). <path> has no
// cheap closed form, so it goes through getBBox(), which needs a layout tree:
// the working document lives in the hidden measure host for exactly that
// reason. A detached DOMParser document would answer 0x0 and leave every path
// unselectable.
const shapeLocalBBox = (el, tag) => {
  const empty = { x: 0, y: 0, width: 0, height: 0 };
  if (tag === "rect") {
    const x = attrNum(el, "x");
    const y = attrNum(el, "y");
    return {
      x,
      y,
      width: attrNum(el, "width"),
      height: attrNum(el, "height"),
    };
  }
  if (tag === "circle") {
    const r = attrNum(el, "r");
    const cx = attrNum(el, "cx");
    const cy = attrNum(el, "cy");
    return { x: cx - r, y: cy - r, width: 2 * r, height: 2 * r };
  }
  if (tag === "ellipse") {
    const rx = attrNum(el, "rx");
    const ry = attrNum(el, "ry");
    const cx = attrNum(el, "cx");
    const cy = attrNum(el, "cy");
    return { x: cx - rx, y: cy - ry, width: 2 * rx, height: 2 * ry };
  }
  if (tag === "line") {
    const x1 = attrNum(el, "x1");
    const y1 = attrNum(el, "y1");
    const x2 = attrNum(el, "x2");
    const y2 = attrNum(el, "y2");
    return {
      x: Math.min(x1, x2),
      y: Math.min(y1, y2),
      width: Math.abs(x2 - x1),
      height: Math.abs(y2 - y1),
    };
  }
  if (tag === "polygon" || tag === "polyline") {
    const nums = (el.getAttribute("points") || "")
      .trim()
      .split(/[\s,]+/)
      .filter(Boolean)
      .map(Number);
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    for (let i = 0; i + 1 < nums.length; i += 2) {
      if (!Number.isFinite(nums[i]) || !Number.isFinite(nums[i + 1])) continue;
      minX = Math.min(minX, nums[i]);
      maxX = Math.max(maxX, nums[i]);
      minY = Math.min(minY, nums[i + 1]);
      maxY = Math.max(maxY, nums[i + 1]);
    }
    return Number.isFinite(minX)
      ? { x: minX, y: minY, width: maxX - minX, height: maxY - minY }
      : empty;
  }
  try {
    const b = el.getBBox();
    return { x: b.x, y: b.y, width: b.width, height: b.height };
  } catch (e) {
    // getBBox may throw if element is not attached to layout
    return empty;
  }
};

const readAll = (svg) => {
  const out = [];

  svg.querySelectorAll(`image,text,${SHAPE_TAGS.join(",")}`).forEach((el) => {
    if (el.closest(NON_RENDERING_SELECTOR)) return;
    if (!el.dataset.editorId) {
      el.dataset.editorId = "U" + uidCounter++;
    }
    const id = el.dataset.editorId;
    const tag = el.tagName.toLowerCase();
    const m = absMatrixOf(el);
    const pure = isPureTranslation(m);
    const homeTx = m[4];
    const homeTy = m[5];
    const own = transformToMatrix(el.getAttribute("transform"));
    const direct = el.parentNode === svg;
    const hadOwnTransform = Boolean(el.getAttribute("transform"));
    const hasOwnOffset = Math.abs(own[4]) > 1e-6 || Math.abs(own[5]) > 1e-6;
    let mode;
    if (!pure) mode = "locked";
    else if (hadOwnTransform || !direct) mode = "translate";
    else if (hasOwnOffset) mode = "translate";
    else mode = "local";

    if (tag === "image") {
      const x = Number.parseFloat(el.getAttribute("x") || 0);
      const y = Number.parseFloat(el.getAttribute("y") || 0);
      const w =
        Number.parseFloat(el.getAttribute("width") || 0) ||
        Number.parseFloat(el.dataset.nw || 200);
      const h =
        Number.parseFloat(el.getAttribute("height") || 0) ||
        Number.parseFloat(el.dataset.nh || 100);
      const bb = cornersBBox(
        [
          [x, y],
          [x + w, y],
          [x + w, y + h],
          [x, y + h],
        ],
        m
      );
      out.push({
        id,
        tag,
        ...bb,
        localX: x,
        localY: y,
        homeTx,
        homeTy,
        ownTx: own[4],
        ownTy: own[5],
        mode,
        group: el.dataset.group || null,
        opacity: Number.parseFloat(el.getAttribute("opacity") || 1),
      });
    } else if (isShapeTag(tag)) {
      const lb = shapeLocalBBox(el, tag);
      const bb = cornersBBox(
        [
          [lb.x, lb.y],
          [lb.x + lb.width, lb.y],
          [lb.x + lb.width, lb.y + lb.height],
          [lb.x, lb.y + lb.height],
        ],
        m
      );
      out.push({
        id,
        tag,
        ...bb,
        localX: lb.x,
        localY: lb.y,
        homeTx,
        homeTy,
        ownTx: own[4],
        ownTy: own[5],
        mode,
        isShape: true,
        kind: tag,
        group: el.dataset.group || null,
        opacity: Number.parseFloat(el.getAttribute("opacity") || 1),
      });
    } else {
      const r = readTextRect(el);
      const bb = cornersBBox(
        [
          [r.x, r.y],
          [r.x + r.w, r.y],
          [r.x + r.w, r.y + r.h],
          [r.x, r.y + r.h],
        ],
        m
      );
      out.push({
        id,
        tag,
        ...bb,
        baseX: r.baseX + homeTx,
        baseY: r.baseY + homeTy,
        localBaseX: r.baseX,
        localBaseY: r.baseY,
        homeTx,
        homeTy,
        ownTx: own[4],
        ownTy: own[5],
        mode,
        group: el.dataset.group || null,
        fontSize: Number.parseFloat(el.getAttribute("font-size") || 24),
        fontFamily: el.getAttribute("font-family") || "Arial, sans-serif",
        fontWeight: el.getAttribute("font-weight") || "normal",
        fill: el.getAttribute("fill") || "#000000",
        anchor: el.getAttribute("text-anchor") || "start",
        text: el.textContent || "",
      });
    }
  });

  // Group wrappers are tracked too (bounds = union of the parts inside), so a
  // whole section can be selected and moved, or ungrouped to edit it piece by
  // piece.
  Array.from(svg.querySelectorAll("g"))
    .filter((g) => !g.closest(NON_RENDERING_SELECTOR))
    .forEach((g) => {
      if (!g.dataset.editorId) {
        g.dataset.editorId = "G" + uidCounter++;
      }
      const id = g.dataset.editorId;
      const parts = out.filter(
        (o) => o.id !== id && g.contains(docNodeById(svg, o.id))
      );
      if (!parts.length) return;
      const x = Math.min(...parts.map((p) => p.x));
      const y = Math.min(...parts.map((p) => p.y));
      const r = Math.max(...parts.map((p) => p.x + p.w));
      const b = Math.max(...parts.map((p) => p.y + p.h));
      const label = (g.getAttribute("class") || "")
        .split(/\s+/)
        .filter(Boolean)
        .join(" ");
      out.push({
        id,
        tag: "g",
        isGroup: true,
        isBlock: g.dataset.block === "1",
        x,
        y,
        w: r - x,
        h: b - y,
        depth: (() => {
          let d = 0;
          let p = g.parentNode;
          while (p && p !== svg) {
            if (p?.nodeName?.toLowerCase() === "g") d++;
            p = p?.parentNode;
          }
          return d;
        })(),
        label,
        childIds: parts.map((p) => p.id),
        group: g.dataset.group || null,
        mode: "translate",
      });
    });

  return out;
};

const docNodeById = (svg, id) =>
  svg.querySelector(`[data-editor-id="${CSS.escape(id)}"]`);

const serialize = (svg, stripIds) => {
  const clone = svg.cloneNode(true);
  if (stripIds) {
    clone
      .querySelectorAll("[data-editor-id]")
      .forEach((n) => {
        delete n.dataset.editorId;
      });
    clone
      .querySelectorAll("[data-group]")
      .forEach((n) => {
        delete n.dataset.group;
      });
    clone
      .querySelectorAll("[data-block]")
      .forEach((n) => {
        delete n.dataset.block;
      });
  }
  clone.removeAttribute("width");
  clone.removeAttribute("height");
  clone.removeAttribute("style");
  return (
    '<?xml version="1.0" encoding="UTF-8" standalone="no"?>' +
    new XMLSerializer().serializeToString(clone)
  );
};

const svgToDataUri = (str) =>
  "data:image/svg+xml;charset=utf-8," + encodeURIComponent(str);

const fileToDataUri = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const resolveHrefSize = (href) =>
  new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve([img.naturalWidth, img.naturalHeight]);
    img.onerror = () => resolve([0, 0]);
    img.src = href;
  });

const prefillImageSizes = async (svg) => {
  const images = Array.from(svg.querySelectorAll("image"));
  await Promise.all(
    images.map(async (img) => {
      const w = Number.parseFloat(img.getAttribute("width"));
      const h = Number.parseFloat(img.getAttribute("height"));
      if (w && h) return;
      const href = img.getAttribute("href") || img.getAttribute("xlink:href");
      if (!href) return;
      const [nw, nh] = await resolveHrefSize(href);
      if (nw && nh) {
        if (!w) img.setAttribute("width", nw);
        if (!h) img.setAttribute("height", nh);
      }
    })
  );
};

// Where <image> actually paints its raster inside the box given by the
// x/y/width/height attributes, honouring preserveAspectRatio (letterboxing).
// Returns the painted rect in the element's own coordinate space plus the
// raster-to-space scale factors, so a crop drawn over the painted area can be
// translated into source pixels for canvas.drawImage().
const paintedRect = (ox, oy, ow, oh, IW, IH, par) => {
  if (!IW || !IH || ow <= 0 || oh <= 0) {
    return { px: ox, py: oy, pw: ow, ph: oh, sx: 1, sy: 1 };
  }
  const tokens = (par || "xMidYMid meet")
    .replace(/\bdefer\b/g, "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  let xAlign = "xMid";
  let yAlign = "yMid";
  let mode = "meet";
  for (const t of tokens) {
    if (t === "none") xAlign = "none";
    else if (/^x(Min|Mid|Max)$/.test(t)) xAlign = t;
    else if (/^y(Min|Mid|Max)$/.test(t)) yAlign = t;
    else if (t === "meet" || t === "slice") mode = t;
  }
  if (xAlign === "none") {
    return { px: ox, py: oy, pw: ow, ph: oh, sx: ow / IW, sy: oh / IH };
  }
  const sx = ow / IW;
  const sy = oh / IH;
  const s = mode === "slice" ? Math.max(sx, sy) : Math.min(sx, sy);
  const dw = ow - IW * s;
  const dh = oh - IH * s;
  let fx = 0.5;
  if (xAlign === "xMin") {
    fx = 0;
  } else if (xAlign === "xMax") {
    fx = 1;
  }
  let fy = 0.5;
  if (yAlign === "yMin") {
    fy = 0;
  } else if (yAlign === "yMax") {
    fy = 1;
  }
  return {
    px: ox + dw * fx,
    py: oy + dh * fy,
    pw: IW * s,
    ph: IH * s,
    sx: s,
    sy: s,
  };
};

// Fallback crop path for images hosted on another origin: drawing them to a
// canvas taints it (toDataURL throws), so re-fetch the bytes first — the
// resulting blob: URL is same-origin and keeps the canvas readable.
const cropViaFetch = async (href, sx, sy, sw, sh) => {
  try {
    const resp = await fetch(href, { mode: "cors" });
    if (!resp.ok) return null;
    const blob = await resp.blob();
    const url = URL.createObjectURL(blob);
    const im = await new Promise((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = reject;
      i.src = url;
    });
    const cv = document.createElement("canvas");
    cv.width = sw;
    cv.height = sh;
    cv.getContext("2d").drawImage(im, sx, sy, sw, sh, 0, 0, sw, sh);
    const out = cv.toDataURL("image/png");
    URL.revokeObjectURL(url);
    return out;
  } catch (e) {
    // Return null when CORS or network prevents fetching the image for cropping
    return null;
  }
};

// An <img>-ready copy of href that is safe to paint onto a canvas: data URIs
// load directly, everything else goes through a CORS fetch to a same-origin
// blob URL first (a bare cross-origin Image would taint the canvas).
const loadDrawable = async (href) => {
  if (!href) return null;
  const direct = () =>
    new Promise((resolve) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = () => resolve(null);
      i.src = href;
    });
  if (!href.startsWith("data:")) {
    try {
      const resp = await fetch(href, { mode: "cors" });
      if (resp.ok) {
        const url = URL.createObjectURL(await resp.blob());
        const im = await new Promise((resolve) => {
          const i = new Image();
          i.onload = () => resolve(i);
          i.onerror = () => resolve(null);
          i.src = url;
        });
        URL.revokeObjectURL(url);
        if (im) return im;
      }
    } catch (e) {
      // fall through to a direct load below
    }
  }
  return direct();
};

const parseViewBox = (svg) => {
  let vbAttr = svg.getAttribute("viewBox");
  if (!vbAttr) {
    const w = Number.parseFloat(svg.getAttribute("width")) || 1240;
    const h = Number.parseFloat(svg.getAttribute("height")) || 1754;
    svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
    vbAttr = `0 0 ${w} ${h}`;
  }
  const pts = vbAttr
    .trim()
    .split(/[\s,]+/)
    .filter(Boolean)
    .map(Number);
  return pts.length === 4
    ? { x: pts[0], y: pts[1], w: pts[2], h: pts[3] }
    : { x: 0, y: 0, w: pts[0] || 1240, h: pts[1] || 1754 };
};

const getElemChipLabel = (el) => {
  if (el.isGroup) {
    const labelPart = el.label ? ` · ${el.label}` : "";
    return `Group${labelPart} · ${el.childIds.length} parts`;
  }
  const prefix = el.group ? "g · " : "";
  if (el.tag === "text") {
    return `${prefix}Text · ${(el.text || "…").slice(0, 18)}`;
  }
  if (el.isShape) {
    const shapeLabel = SHAPE_LABELS[el.tag] || el.tag;
    return `${prefix}${shapeLabel} · ${el.id}`;
  }
  return `${prefix}Image · ${el.id}`;
};

// NOSONAR
const CertificateEditorPanel = ({ embedded = false }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  const [courseQuery, setCourseQuery] = useState("");
  const [courseResults, setCourseResults] = useState([]);
  const [searchingCourses, setSearchingCourses] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [batches, setBatches] = useState([]);
  const [selectedBatchId, setSelectedBatchId] = useState("");
  const [templates, setTemplates] = useState([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [loadingBatches, setLoadingBatches] = useState(false);
  const [loadingTemplate, setLoadingTemplate] = useState(false);
  const [templateError, setTemplateError] = useState(null);
  const [templateName, setTemplateName] = useState("");

  const [vb, setVb] = useState({ x: 0, y: 0, w: 1240, h: 1754 });
  const [elems, setElems] = useState([]);
  const [svgStr, setSvgStr] = useState("");
  const [activeId, setActiveId] = useState(null);
  const [showGrid, setShowGrid] = useState(false);
  const [undo, setUndo] = useState([]);
  const [redo, setRedo] = useState([]);
  const [selIds, setSelIds] = useState([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [sourceOpen, setSourceOpen] = useState(false);
  const [zoom, setZoom] = useState(0);
  const [toast, setToast] = useState("");
  // Split-image mode: splitId is the source image being carved up, splitRects
  // are confirmed crop boxes in canvas (viewBox) coordinates, splitDraft is
  // the box currently being dragged out.
  const [splitId, setSplitId] = useState(null);
  const [splitRects, setSplitRects] = useState([]);
  const [splitDraft, setSplitDraft] = useState(null);
  const [splitBusy, setSplitBusy] = useState(false);

  const canvasRef = useRef(null);
  const dragRef = useRef(null);
  const resizeRef = useRef(null);
  const splitDraftRef = useRef(null);
  const docRef = useRef(null);
  const elemsRef = useRef([]);
  const vbRef = useRef(vb);

  elemsRef.current = elems;
  vbRef.current = vb;

  // Hidden sandboxed iframe that hosts the working SVG so it has a layout
  // tree: getBBox() answers 0x0 on a detached DOMParser document, which would
  // leave every <path> with an empty selection box. The sandbox deliberately
  // has no "allow-scripts", so scripts and inline handlers inside an uploaded
  // template stay inert, and being a separate document it also keeps the
  // certificate's <style> out of the app (and the app's CSS out of it).
  const measureFrameRef = useRef(null);
  const searchSeqRef = useRef(0);

  const releaseMeasure = () => {
    const frame = measureFrameRef.current;
    if (frame?.parentNode) frame.remove();
    measureFrameRef.current = null;
  };

  const attachForMeasure = (svg) => {
    let frame = measureFrameRef.current;
    if (!frame?.contentDocument) {
      releaseMeasure();
      frame = document.createElement("iframe");
      frame.setAttribute("sandbox", "allow-same-origin");
      frame.setAttribute("aria-hidden", "true");
      frame.setAttribute("tabindex", "-1");
      frame.style.cssText =
        "position:fixed;left:-100000px;top:0;width:900px;height:700px;border:0;pointer-events:none;";
      document.body.appendChild(frame);
      if (!frame.contentDocument) {
        frame.remove();
        console.warn(
          "Certificate editor: no measure host available, path selection is limited."
        );
        return;
      }
      frame.contentDocument.body.style.margin = "0";
      measureFrameRef.current = frame;
    }
    const body = frame.contentDocument.body;
    while (body.firstChild) body.firstChild.remove();
    body.appendChild(svg);
  };

  useEffect(() => releaseMeasure, []);

  const notify = (msg) => setToast(msg);

  const activeEl = elems.find((e) => e.id === activeId) || null;
  const splitEl = splitId ? elems.find((e) => e.id === splitId) || null : null;
  const selectedElems = selIds
    .map((id) => elems.find((e) => e.id === id))
    .filter(Boolean);
  const selectedNet = selectedElems.filter(
    (e) => e.tag === "text" || e.tag === "image" || e.isShape
  );

  useEffect(() => {
    const roles = JSON.parse(sessionStorage.getItem("roles") || "[]");
    const admin = Array.isArray(roles) && roles.some((r) => ADMIN_ROLES.has(r));
    setIsAdmin(admin);
    setPageLoading(false);
  }, []);

  const pushPreview = React.useCallback(() => {
    if (docRef.current) setSvgStr(serialize(docRef.current, false));
  }, []);

  const pushHistory = React.useCallback(() => {
    if (!docRef.current) return;
    setUndo((s) => [...s.slice(-39), serialize(docRef.current, false)]);
    setRedo([]);
  }, []);

  const recompute = React.useCallback(() => {
    if (!docRef.current) return;
    setElems(readAll(docRef.current));
    pushPreview();
  }, [pushPreview]);

  const mutate = React.useCallback(
    (fn) => {
      if (!docRef.current) return;
      pushHistory();
      const result = fn();
      recompute();
      return result;
    },
    [pushHistory, recompute]
  );

  const applyDoc = React.useCallback((domSvg, theVb) => {
    // The document has to be in the measure host before readAll runs: that is
    // the only place a <path> can measure itself with getBBox().
    attachForMeasure(domSvg);
    docRef.current = domSvg;
    setVb(theVb);
    // The preview string is committed first, so a failure while indexing the
    // elements can never leave the canvas empty.
    setSvgStr(serialize(domSvg, false));
    setElems(readAll(domSvg));
  }, []);

  const applySnapshot = React.useCallback(
    (str) => {
      const parser = new DOMParser();
      const parsed = parser.parseFromString(str, "image/svg+xml");
      if (parsed.querySelector("parsererror")) return;
      const svg = parsed.documentElement;
      applyDoc(svg, parseViewBox(svg));
    },
    [applyDoc]
  );

  const undoAction = React.useCallback(() => {
    if (undo.length === 0) return;
    const prev = undo[undo.length - 1];
    setUndo((s) => s.slice(0, -1));
    setRedo((s) => [...s, serialize(docRef.current, false)]);
    applySnapshot(prev);
  }, [undo, applySnapshot]);

  const redoAction = React.useCallback(() => {
    if (redo.length === 0) return;
    const next = redo[redo.length - 1];
    setRedo((s) => s.slice(0, -1));
    setUndo((s) => [...s, serialize(docRef.current, false)]);
    applySnapshot(next);
  }, [redo, applySnapshot]);

  useEffect(() => {
    const onKey = (e) => {
      // While split mode is armed the keyboard belongs to it (Escape is
      // handled by its own listener below), so Delete/arrows/undo cannot
      // yank the source image away mid-crop.
      if (splitId) return;
      if (!activeId || !docRef.current) return;
      if (!elemsRef.current.some((x) => x.id === activeId)) return;
      const step = e.shiftKey ? 10 : 1;
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
        e.preventDefault();
        const moves = {
          ArrowUp: [0, -step],
          ArrowDown: [0, step],
          ArrowLeft: [-step, 0],
          ArrowRight: [step, 0],
        };
        moveElementBy(activeId, moves[e.key][0], moves[e.key][1]);
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
        e.preventDefault();
        if (e.shiftKey) redoAction();
        else undoAction();
      } else if (e.key === "Delete") {
        e.preventDefault();
        removeElement(activeId);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeId, undoAction, redoAction, splitId]);

  useEffect(() => {
    const onEsc = (e) => {
      if (e.key === "Escape" && splitId) cancelSplit();
    };
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [splitId]);

  // Clicking a different chip (or undoing the source away) leaves split mode
  // with nothing to carve: drop the mode instead of drawing boxes in the void.
  useEffect(() => {
    if (splitId && activeId !== splitId && !splitBusy) cancelSplit();
  }, [splitId, activeId, splitBusy]);

  // Debounced course search: fires ~400ms after typing stops (and clears
  // the list when the box is emptied). searchCourses is intentionally left
  // out of the deps — it is recreated every render and would refire the
  // search on unrelated state changes.
  useEffect(() => {
    const q = courseQuery.trim();
    if (!q) {
      searchSeqRef.current += 1;
      setCourseResults([]);
      return undefined;
    }
    const t = setTimeout(searchCourses, 400);
    return () => clearTimeout(t);
  }, [courseQuery]);

  // NOSONAR
  const setNodePos = (node, el, nx, ny) => {
    if (el.tag === "text" || el.tag === "image") {
      if (el.mode === "local") {
        if (el.tag === "text") {
          let baseX = nx;
          if (el.anchor === "middle") {
            baseX = nx + el.w / 2;
          } else if (el.anchor === "end") {
            baseX = nx + el.w;
          }
          const baseY = ny + el.fontSize * 0.95;
          node.setAttribute("x", baseX);
          node.setAttribute("y", baseY);
        } else {
          node.setAttribute("x", nx);
          node.setAttribute("y", ny);
        }
        return;
      }
    }
    const anc = ancestorsMatrixOf(node);
    const inv = invMat(anc);
    const dx = nx - el.x;
    const dy = ny - el.y;
    const tx = inv[0] * dx + inv[2] * dy;
    const ty = inv[1] * dx + inv[3] * dy;
    const own = transformToMatrix(node.getAttribute("transform"));
    own[4] += tx;
    own[5] += ty;
    setElementTransform(node, own);
  };

  const moveElementBy = (id, dx, dy) => {
    const el0 = elemsRef.current.find((x) => x.id === id);
    if (!el0) return;
    // Arrow keys follow the drag rule: a part of a signature/grouped block
    // nudges the whole block, everything else moves on its own.
    let anchor = id;
    if (!el0.isGroup && !el0.group) {
      const gid = parentGroupOf(id);
      const gEl = gid ? elemsRef.current.find((x) => x.id === gid) : null;
      if (gEl?.isBlock) anchor = gid;
    }
    const aEl =
      anchor === id ? el0 : elemsRef.current.find((x) => x.id === anchor);
    mutate(() => {
      const ids = new Set([anchor]);
      if (aEl?.group) {
        elemsRef.current.forEach((el) => {
          if (el.group === aEl.group) ids.add(el.id);
        });
      }
      ids.forEach((i) => {
        const node = docRef.current?.querySelector(`[data-editor-id="${i}"]`);
        const el = elemsRef.current.find((x) => x.id === i);
        if (node && el) setNodePos(node, el, el.x + dx, el.y + dy);
      });
    });
  };

  // Grouping wraps the picked parts in a real <g> so they can be moved and
  // ungrouped like any template group. Parts that do not share one parent
  // cannot be wrapped without shifting them, so those keep an editor-only
  // data-group tag instead (stripped on export).
  const groupSelection = () => {
    const ids = selIds.filter((id) =>
      elemsRef.current.some((el) => el.id === id)
    );
    if (ids.length < 2) return;
    const nodes = ids
      .map((id) => docRef.current?.querySelector(`[data-editor-id="${id}"]`))
      .filter(Boolean);
    if (nodes.length !== ids.length) return;
    const gid = "G" + uidCounter++;
    const sameParent = nodes.every((n) => n.parentNode === nodes[0].parentNode);
    mutate(() => {
      if (!sameParent) {
        nodes.forEach((n) => {
          n.dataset.group = gid;
        });
        return;
      }
      const g = docRef.current.ownerDocument.createElementNS(
        "http://www.w3.org/2000/svg",
        "g"
      );
      g.dataset.editorId = gid;
      g.dataset.block = "1";
      nodes[0].before(g);
      nodes.forEach((n) => g.appendChild(n));
    });
    setSelIds([gid]);
    setActiveId(gid);
    notify(
      sameParent
        ? "Grouped — move it as one, or Ungroup to edit the parts"
        : "Grouped for editing (parts stay in place)"
    );
  };

  // Ungrouping dissolves the selected real <g>: the group's own transform is
  // baked into each child first, so nothing moves on screen while every part
  // becomes independently selectable.
  const ungroupActive = () => {
    const el = elemsRef.current.find((e) => e.id === activeId);
    if (!el) return;
    const node = docRef.current?.querySelector(`[data-editor-id="${el.id}"]`);
    if (!node) return;

    if (el.isGroup && node.nodeName.toLowerCase() === "g") {
      const gm = transformToMatrix(node.getAttribute("transform"));
      const parent = node.parentNode;
      const kids = Array.from(node.children);
      const kidIds = kids
        .map((k) => k.dataset.editorId)
        .filter(Boolean);
      mutate(() => {
        while (node.firstChild) {
          const child = node.firstChild;
          if (child.nodeType === 1 && !NON_RENDERING_TAGS.has(child.nodeName)) {
            const cm = transformToMatrix(child.getAttribute("transform"));
            setElementTransform(child, mulMat(gm, cm));
          }
          node.before(child);
        }
        node.remove();
      });
      setSelIds(kidIds);
      setActiveId(kidIds.length === 1 ? kidIds[0] : null);
      notify("Group dissolved — its parts can now be edited individually");
      return;
    }

    if (!el.group) return;
    const gid = el.group;
    mutate(() => {
      docRef.current
        ?.querySelectorAll(`[data-group="${gid}"]`)
        .forEach((n) => {
          delete n.dataset.group;
        });
    });
    notify("Grouping cleared");
  };

  const patchNodePos = (pos) => {
    const node = docRef.current?.querySelector(
      `[data-editor-id="${activeId}"]`
    );
    const el = elemsRef.current.find((x) => x.id === activeId);
    if (!node || !el) return;
    mutate(() => {
      setNodePos(node, el, pos.x ?? el.x, pos.y ?? el.y);
    });
  };

  const loadSource = async (raw, title) => {
    try {
      setTemplateError(null);
      setLoadingTemplate(true);
      const str = decodeSvg(raw);
      const parser = new DOMParser();
      const parsed = parser.parseFromString(str, "image/svg+xml");
      if (parsed.querySelector("parsererror")) {
        throw new Error("Invalid SVG content");
      }
      const svg = parsed.documentElement;
      if (svg.tagName.toLowerCase() !== "svg") {
        throw new Error("Uploaded file is not an SVG");
      }
      const theVb = parseViewBox(svg);
      await prefillImageSizes(svg);
      const n = expandEmbeddedSvgs(svg);
      if (n > 0) {
        notify(
          `Expanded ${n} embedded SVG graphic${
            n > 1 ? "s" : ""
          } — the shapes inside are now individually editable`
        );
      }
      applyDoc(svg, theVb);
      setActiveId(null);
      setSelIds([]);
      setUndo([]);
      setRedo([]);
      setTemplateName(title || "");
      setSourceOpen(false);
    } catch (e) {
      console.error("Error loading SVG:", e);
      setTemplateError("Could not load the selected certificate SVG.");
    } finally {
      setLoadingTemplate(false);
    }
  };

  const searchCourses = async () => {
    const seq = ++searchSeqRef.current;
    setSearchingCourses(true);
    try {
      const url = `${urlConfig.URLS.PUBLIC_PREFIX}${urlConfig.URLS.CONTENT.SEARCH}`;
      const response = await axios.post(url, {
        request: {
          query: courseQuery,
          filters: { contentType: ["Course"], status: ["Live"] },
          limit: 10,
          offset: 0,
          fields: ["name", "identifier"],
        },
      });
      if (seq === searchSeqRef.current)
        setCourseResults(response?.data?.result?.content || []);
    } catch (e) {
      console.error("Error searching courses:", e);
      if (seq === searchSeqRef.current) setCourseResults([]);
    } finally {
      if (seq === searchSeqRef.current) setSearchingCourses(false);
    }
  };

  const pickCourse = async (course) => {
    setSelectedCourse(course);
    setSelectedBatchId("");
    setBatches([]);
    setTemplates([]);
    setLoadingBatches(true);
    try {
      const url = `${urlConfig.URLS.LEARNER_PREFIX}${urlConfig.URLS.BATCH.GET_BATCHS}`;
      const response = await axios.post(url, {
        request: {
          filters: { courseId: course.identifier },
          sort_by: { createdDate: "desc" },
        },
      });
      const content = response?.data?.result?.response?.content || [];
      setBatches(content);
    } catch (e) {
      console.error("Error fetching batches:", e);
    } finally {
      setLoadingBatches(false);
    }
  };

  const pickBatch = (batchId) => {
    const batch = batches.find((b) => b.batchId === batchId);
    setSelectedBatchId(batchId);
    const certTemplates = batch?.cert_templates || batch?.certTemplates || {};
    setTemplates(
      Object.keys(certTemplates).map((id) => ({ id, ...certTemplates[id] }))
    );
    setSelectedTemplateId("");
  };

  const pickTemplate = async (tplId) => {
    const tpl = templates.find((t) => t.id === tplId);
    setSelectedTemplateId(tplId);
    if (!tpl) return;
    if (tpl.certificateTemplate) {
      await loadSource(tpl.certificateTemplate, tpl.name || tplId);
      return;
    }
    if (tpl.url?.startsWith("data:")) {
      await loadSource(tpl.url, tpl.name || tplId);
      return;
    }
    if (tpl.url) {
      try {
        const res = await axios.get(tpl.url, { responseType: "text" });
        await loadSource(res.data, tpl.name || tplId);
      } catch (e) {
        console.error("Error fetching template url:", e);
        setTemplateError(
          "Could not fetch the template from its URL. Try uploading the SVG directly."
        );
      }
      return;
    }
    setTemplateError("This template has no SVG source. Try another.");
  };

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const dataUri = await fileToDataUri(file);
    await loadSource(dataUri, file.name.replace(/\.svg$/i, ""));
    e.target.value = "";
  };

  const getSvgPoint = (clientX, clientY) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const scale = rect.width / vbRef.current.w;
    return {
      x: (clientX - rect.left) / scale + vbRef.current.x,
      y: (clientY - rect.top) / scale + vbRef.current.y,
      scale,
    };
  };

  const hitTest = (x, y, wantGroup) => {
    const list = elemsRef.current;
    const hits = list.filter(
      (el) =>
        el.w > 0 &&
        el.h > 0 &&
        y >= el.y &&
        y <= el.y + el.h &&
        x >= el.x &&
        el.x + el.w >= x
    );
    if (!hits.length) return null;
    // Smallest target wins so a single part inside a big group stays reachable;
    // Alt-click (wantGroup) picks the enclosing group instead.
    const pool = hits.filter((el) => (wantGroup ? el.isGroup : !el.isGroup));
    const target = pool.length ? pool : hits;
    return target.reduce((a, b) => (a.w * a.h <= b.w * b.h ? a : b));
  };

  const parentGroupOf = (id) => {
    const node = docRef.current?.querySelector(`[data-editor-id="${id}"]`);
    const g = node?.parentElement?.closest("g[data-editor-id]");
    return g?.dataset.editorId || null;
  };

  const snapPoint = (x, y, w, h, primaryId) => {
    if (!primaryId) return { x, y, xs: [], ys: [] };
    const G = 4;
    const others = elemsRef.current.filter((e) => e.id !== primaryId);
    const linesX = others.flatMap((e) => [e.x, e.x + e.w / 2, e.x + e.w]);
    linesX.push(vbRef.current.w / 2);
    const linesY = others.flatMap((e) => [e.y, e.y + e.h / 2, e.y + e.h]);
    linesY.push(vbRef.current.h / 2);
    let ax = x;
    let ay = y;
    const xs = [];
    const ys = [];
    let bestDx = G;
    let bestXLine = null;
    [
      { off: x, ww: 0, kind: "left" },
      { off: x + w / 2, ww: 0, kind: "cx" },
      { off: x + w, ww: 0, kind: "right" },
    ].forEach((ed) => {
      linesX.forEach((ln) => {
        const d = Math.abs(ed.off - ln);
        if (d < bestDx) {
          bestDx = d;
          bestXLine = ln;
          if (ed.kind === "left") ax = x + (ln - ed.off);
          else if (ed.kind === "cx") ax = x + w / 2 + (ln - ed.off) - w / 2;
          else ax = x + w + (ln - ed.off) - w;
        }
      });
    });
    if (bestXLine !== null) xs.push(bestXLine);
    let bestDy = G;
    let bestYLine = null;
    [
      { off: y, hh: 0, kind: "top" },
      { off: y + h / 2, hh: 0, kind: "cy" },
      { off: y + h, hh: 0, kind: "bottom" },
    ].forEach((ed) => {
      linesY.forEach((ln) => {
        const d = Math.abs(ed.off - ln);
        if (d < bestDy) {
          bestDy = d;
          bestYLine = ln;
          if (ed.kind === "top") ay = y + (ln - ed.off);
          else if (ed.kind === "cy") ay = y + h / 2 + (ln - ed.off) - h / 2;
          else ay = y + h + (ln - ed.off) - h;
        }
      });
    });
    if (bestYLine !== null) ys.push(bestYLine);
    return { x: ax, y: ay, xs, ys };
  };

  // NOSONAR
  const applyResize = (node, el, res, dx, dy) => {
    const corner = res.handle.length === 2;
    let nw = res.origW;
    let nh = res.origH;
    if (corner) {
      const sx = (res.handle.includes("w") ? -dx : dx) / Math.max(res.origW, 1);
      const sy = (res.handle.includes("n") ? -dy : dy) / Math.max(res.origH, 1);
      const s = Math.abs(sx) >= Math.abs(sy) ? 1 + sx : 1 + sy;
      nw = Math.max(12, res.origW * s);
      nh = Math.max(12, res.origH * s);
    } else {
      if (res.handle.includes("w")) nw = Math.max(12, res.origW - dx);
      if (res.handle.includes("e")) nw = Math.max(12, res.origW + dx);
      if (res.handle.includes("n")) nh = Math.max(12, res.origH - dy);
      if (res.handle.includes("s")) nh = Math.max(12, res.origH + dy);
    }
    if (el.tag === "image") {
      node.setAttribute("width", Math.round(nw));
      node.setAttribute("height", Math.round(nh));
      if (el.mode === "local") {
        if (res.handle.includes("w"))
          node.setAttribute("x", Math.round(res.origX + (res.origW - nw)));
        if (res.handle.includes("n"))
          node.setAttribute("y", Math.round(res.origY + (res.origH - nh)));
      }
    } else if (el.isShape) {
      const anc = ancestorsMatrixOf(node);
      const inv = invMat(anc);
      const sx = nw / Math.max(res.origW, 1);
      const sy = res.origH < 1 ? 1 : nh / Math.max(res.origH, 1);
      let ax = res.origX;
      let ay = res.origY;
      if (res.handle.includes("w")) ax = res.origX + res.origW;
      if (res.handle.includes("n")) ay = res.origY + res.origH;
      const scale = mulMat(
        [1, 0, 0, 1, ax, ay],
        mulMat([sx, 0, 0, sy, 0, 0], [1, 0, 0, 1, -ax, -ay])
      );
      const own = transformToMatrix(node.getAttribute("transform"));
      const next = mulMat(mulMat(inv, scale), mulMat(anc, own));
      setElementTransform(node, next);
    } else {
      const fs = Math.max(
        6,
        Math.round(res.origFS * (nw / Math.max(res.origW, 1)))
      );
      node.setAttribute("font-size", fs);
    }
    recompute();
  };

  // NOSONAR
  const onCanvasMouseDown = (e) => {
    if (e.button !== 0) return;
    const { x, y } = getSvgPoint(e.clientX, e.clientY);

    if (splitId) {
      const target = elemsRef.current.find((el) => el.id === splitId);
      if (!target) {
        cancelSplit();
        return;
      }
      // Drag starts a crop box, clamped to the source image's bounds.
      const cx = Math.min(Math.max(x, target.x), target.x + target.w);
      const cy = Math.min(Math.max(y, target.y), target.y + target.h);
      splitDraftRef.current = { x0: cx, y0: cy };
      setSplitDraft({ x: cx, y: cy, w: 0, h: 0 });
      return;
    }

    const active = elemsRef.current.find((el) => el.id === activeId);
    if (
      active &&
      (active.tag === "image" || active.tag === "text" || active.isShape) &&
      canvasRef.current
    ) {
      const rect = canvasRef.current.getBoundingClientRect();
      const { scale } = getSvgPoint(e.clientX, e.clientY);
      const L = (active.x - vbRef.current.x) * scale;
      const T = (active.y - vbRef.current.y) * scale;
      const R = (active.x + active.w - vbRef.current.x) * scale;
      const B = (active.y + active.h - vbRef.current.y) * scale;
      const handles = {
        nw: [L, T],
        n: [(L + R) / 2, T],
        ne: [R, T],
        e: [R, (T + B) / 2],
        se: [R, B],
        s: [(L + R) / 2, B],
        sw: [L, B],
        w: [L, (T + B) / 2],
      };
      let label = null;
      Object.keys(handles).forEach((k) => {
        if (
          Math.hypot(
            e.clientX - rect.left - handles[k][0],
            e.clientY - rect.top - handles[k][1]
          ) <= 9
        )
          label = k;
      });
      if (label) {
        resizeRef.current = {
          id: active.id,
          handle: label,
          startX: e.clientX,
          startY: e.clientY,
          origX: active.x,
          origY: active.y,
          origW: active.w,
          origH: active.h,
          origFS: active.fontSize || 24,
          mutating: false,
        };
        return;
      }
    }

    const hit = hitTest(x, y, e.altKey);
    if (e.shiftKey) {
      if (hit) {
        setSelIds((s) =>
          s.includes(hit.id) ? s.filter((i) => i !== hit.id) : [...s, hit.id]
        );
        setActiveId(hit.id);
      }
    } else if (hit) {
      setSelIds([hit.id]);
      setActiveId(hit.id);
    } else {
      setSelIds([]);
      setActiveId(null);
    }
    if (hit) {
      let ids;
      if (selIds.includes(hit.id) && selIds.length > 1) {
        ids = selIds.filter((id) =>
          elemsRef.current.some((el) => el.id === id)
        );
      } else {
        ids = [hit.id];
        if (hit.group) {
          elemsRef.current.forEach((el) => {
            if (el.group === hit.group && !ids.includes(el.id)) ids.push(el.id);
          });
        }
      }
      // Parts of an editor-authored block (signature footer, an explicit
      // "Group selection as one") travel together: dragging any part shifts
      // the block. Template <g> wrappers keep part-level dragging so a
      // certificate-wide group can never swallow a single click.
      const blocks = new Set();
      ids.forEach((id) => {
        const el = elemsRef.current.find((x) => x.id === id);
        if (!el || el.isGroup || el.group) return;
        const gid = parentGroupOf(id);
        const gEl = gid ? elemsRef.current.find((x) => x.id === gid) : null;
        if (gEl?.isBlock) blocks.add(gid);
      });
      if (blocks.size) {
        ids = [
          ...new Set(
            ids.map((id) => {
              const el = elemsRef.current.find((x) => x.id === id);
              if (!el || el.isGroup) return id;
              const gid = parentGroupOf(id);
              return gid && blocks.has(gid) ? gid : id;
            })
          ),
        ];
      }
      const grp = ids
        .map((id) => {
          const el = elemsRef.current.find((e2) => e2.id === id);
          return el ? { id, x: el.x, y: el.y } : null;
        })
        .filter(Boolean);
      dragRef.current = {
        ids: new Set(ids),
        grp,
        primary: hit.id,
        startX: e.clientX,
        startY: e.clientY,
        origX: hit.x,
        origY: hit.y,
        moved: false,
      };
    }
  };

  const onCanvasMouseMove = (e) => {
    const draft = splitDraftRef.current;
    if (splitId && draft) {
      const target = elemsRef.current.find((el) => el.id === splitId);
      if (!target) return;
      const { x, y } = getSvgPoint(e.clientX, e.clientY);
      const cx = Math.min(Math.max(x, target.x), target.x + target.w);
      const cy = Math.min(Math.max(y, target.y), target.y + target.h);
      setSplitDraft({
        x: Math.min(draft.x0, cx),
        y: Math.min(draft.y0, cy),
        w: Math.abs(cx - draft.x0),
        h: Math.abs(cy - draft.y0),
      });
      return;
    }
    const resize = resizeRef.current;
    if (resize) {
      const node = docRef.current?.querySelector(
        `[data-editor-id="${resize.id}"]`
      );
      const el = elemsRef.current.find((el2) => el2.id === resize.id);
      if (!node || !el) return;
      if (!resize.mutating) {
        pushHistory();
        resize.mutating = true;
      }
      const { scale } = getSvgPoint(e.clientX, e.clientY);
      const dx = (e.clientX - resize.startX) / scale;
      const dy = (e.clientY - resize.startY) / scale;
      applyResize(node, el, resize, dx, dy);
      return;
    }
    const drag = dragRef.current;
    if (!drag) return;
    if (!drag.mutating) {
      pushHistory();
      drag.mutating = true;
    }
    const { scale } = getSvgPoint(e.clientX, e.clientY);
    const dx = (e.clientX - drag.startX) / scale;
    const dy = (e.clientY - drag.startY) / scale;
    if (Math.abs(dx) + Math.abs(dy) > 1) drag.moved = true;
    const primary = elemsRef.current.find((el) => el.id === drag.primary);
    const snapped = snapPoint(
      drag.origX + dx,
      drag.origY + dy,
      primary.w,
      primary.h,
      drag.primary
    );
    const offX = snapped.x - drag.origX;
    const offY = snapped.y - drag.origY;
    drag.grp.forEach((m) => {
      const node = docRef.current?.querySelector(`[data-editor-id="${m.id}"]`);
      const el = elemsRef.current.find((e2) => e2.id === m.id);
      if (!node || !el) return;
      setNodePos(node, el, m.x + offX, m.y + offY);
    });
    recompute();
  };

  const onCanvasMouseUp = () => {
    if (splitDraftRef.current) {
      splitDraftRef.current = null;
      const rect = splitDraft;
      setSplitDraft(null);
      if (rect && rect.w > 3 && rect.h > 3) setSplitRects((s) => [...s, rect]);
      return;
    }
    dragRef.current = null;
    resizeRef.current = null;
  };

  const patchEl = (patch) => {
    const node = docRef.current?.querySelector(
      `[data-editor-id="${activeId}"]`
    );
    if (!node) return;
    mutate(() => {
      Object.keys(patch).forEach((k) => {
        node.setAttribute(k, patch[k]);
      });
    });
  };

  const useNaturalSize = async () => {
    const node = docRef.current?.querySelector(
      `[data-editor-id="${activeId}"]`
    );
    if (!node || activeEl?.tag !== "image") return;
    const href = node.getAttribute("href") || node.getAttribute("xlink:href");
    if (!href) return;
    const [nw, nh] = await resolveHrefSize(href);
    if (!nw || !nh) return;
    mutate(() => {
      node.setAttribute("width", nw);
      node.setAttribute("height", nh);
    });
  };

  const replaceImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const dataUri = await fileToDataUri(file);
    const node = docRef.current?.querySelector(
      `[data-editor-id="${activeId}"]`
    );
    if (!node) return;
    mutate(() => node.setAttribute("href", dataUri));
    e.target.value = "";
  };

  const addText = () => {
    const id = "T" + uidCounter++;
    const fontSize = 48;
    mutate(() => {
      const ns = "http://www.w3.org/2000/svg";
      const t = docRef.current.ownerDocument.createElementNS(ns, "text");
      t.dataset.editorId = id;
      t.setAttribute("x", vbRef.current.w / 2);
      t.setAttribute("y", vbRef.current.h / 2);
      t.setAttribute("font-size", fontSize);
      t.setAttribute("fill", "#111111");
      t.setAttribute("text-anchor", "middle");
      t.setAttribute("font-family", "Arial, sans-serif");
      t.textContent = "[[RecipientName]]";
      docRef.current.appendChild(t);
    });
    setActiveId(id);
  };

  // The signature footer chrome used by the existing CITIIS / Form-Based-Codes
  // templates: a thin grey separator dash plus two bold centred caption lines,
  // wrapped in a group so the whole block can be dragged or repositioned. The
  // signature image itself is imported through the normal logo importer.
  const createSignatureBlock = (index) => {
    const svg = docRef.current;
    const ns = "http://www.w3.org/2000/svg";
    const W = vbRef.current.w;
    const H = vbRef.current.h;
    const kx = W / 841.855;
    const ky = H / 595;
    const sid = uidCounter++;
    const gid = "G" + uidCounter++;

    const g = svg.ownerDocument.createElementNS(ns, "g");
    g.dataset.editorId = gid;
    // Marks the wrapper as an editor-authored block: dragging any of its
    // parts (separator, captions, sign) shifts the whole block as one.
    g.dataset.block = "1";
    g.setAttribute("transform", `translate(${(455 - index * 230) * kx} 0)`);
    svg.appendChild(g);

    const dash = svg.ownerDocument.createElementNS(ns, "rect");
    dash.setAttribute("class", "digital-sign-separater");
    dash.setAttribute("x", -130 * kx);
    dash.setAttribute("y", 490.3 * ky);
    dash.setAttribute("width", 215 * kx);
    dash.setAttribute("height", Math.max(0.75, 0.75 * ky));
    dash.setAttribute("fill", "#9A9A9A");
    g.appendChild(dash);

    [
      ["Name, Designation", 510],
      ["Organisation", 525],
    ].forEach(([label, ty]) => {
      const t = svg.ownerDocument.createElementNS(ns, "text");
      t.dataset.editorId = "T" + uidCounter++;
      t.setAttribute("class", "signature-title");
      t.setAttribute("id", `signatureTitle${sid}`);
      t.setAttribute("x", -20 * kx);
      t.setAttribute("y", ty * ky);
      t.setAttribute("font-family", "ArialMT");
      t.setAttribute("font-size", 11 * kx);
      t.setAttribute("font-weight", "bold");
      t.setAttribute("text-anchor", "middle");
      t.setAttribute("fill", "#333333");
      t.setAttribute("stroke", "#333333");
      t.setAttribute("stroke-width", "0");
      t.setAttribute("xml:space", "preserve");
      t.textContent = label;
      g.appendChild(t);
    });
    return gid;
  };

  const addSignatureBlock = () => {
    if (!docRef.current) return;
    // A sign selected before the block exists is absorbed into it, so sign +
    // separator + captions always end up as one draggable unit whichever way
    // the two were created.
    const selEl = elemsRef.current.find((x) => x.id === activeId);
    const adoptNode =
      selEl?.tag === "image" && !selEl.isGroup
        ? docRef.current.querySelector(
            `[data-editor-id="${CSS.escape(activeId)}"]`
          )
        : null;
    const gid = mutate(() => {
      const g = createSignatureBlock(0);
      if (adoptNode) {
        const gNode = docRef.current.querySelector(
          `[data-editor-id="${CSS.escape(g)}"]`
        );
        if (gNode) reparentInto(gNode, adoptNode);
      }
      return g;
    });
    setSelIds([gid]);
    setActiveId(gid);
    notify(
      adoptNode
        ? "Signature block created with the selected sign — drag any part to move them all"
        : "Signature footer added — add the sign with Add logos, drag any part to move the block"
    );
  };

  // NOSONAR
  const addImages = async (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = "";
    if (!files.length || !docRef.current) return;
    const ns = "http://www.w3.org/2000/svg";
    const newIds = [];
    const W = vbRef.current.w;
    const H = vbRef.current.h;

    const dataUris = await Promise.all(files.map(fileToDataUri));

    // Images join the block the selection belongs to (signature flow: footer
    // block first, then "Add logos" for the sign), so the sign, separator and
    // captions travel as one unit instead of loose root children.
    const selEl = elemsRef.current.find((x) => x.id === activeId);
    const selGid = selEl
      ? selEl.isGroup
        ? activeId
        : parentGroupOf(activeId)
      : null;
    const selGEl = selGid ? elemsRef.current.find((x) => x.id === selGid) : null;
    const joinNode =
      selGEl?.isBlock
        ? docRef.current.querySelector(
            `[data-editor-id="${CSS.escape(selGid)}"]`
          )
        : null;
    const joinGroup = !selEl?.isGroup ? selEl?.group : null;

    mutate(() => {
      dataUris.forEach((dataUri, i) => {
        const id = "I" + uidCounter++;
        const w = Math.min(180, W * 0.16);
        const h = (w * 3) / 4;
        const step = i * (w * 0.22);
        const img = docRef.current.ownerDocument.createElementNS(ns, "image");
        img.dataset.editorId = id;
        img.setAttribute("href", dataUri);
        img.setAttribute("x", Math.min(W - w, W * 0.06 + step));
        img.setAttribute("y", Math.min(H - h, H * 0.06 + step));
        img.setAttribute("width", w);
        img.setAttribute("height", h);
        if (joinNode) {
          reparentInto(joinNode, img);
        } else {
          docRef.current.appendChild(img);
          if (joinGroup) img.dataset.group = joinGroup;
        }
        newIds.push(id);
      });
    });

    if (newIds.length) {
      setSelIds(newIds);
      setActiveId(newIds.length === 1 ? newIds[0] : null);
    }
    const plural = newIds.length > 1 ? "s" : "";
    const msg = joinNode
      ? `Added ${newIds.length} sign${plural} to the block — drag any part to move them all together`
      : `Added ${newIds.length} logo${plural}`;
    notify(msg);
  };

  const startSplit = () => {
    if (!activeEl || activeEl.tag !== "image" || activeEl.isGroup) return;
    splitDraftRef.current = null;
    setSplitDraft(null);
    setSplitRects([]);
    setSplitId(activeEl.id);
    notify(
      "Drag a box over each part of the image, then press Create — each part becomes its own logo"
    );
  };

  const cancelSplit = () => {
    splitDraftRef.current = null;
    setSplitDraft(null);
    setSplitRects([]);
    setSplitId(null);
  };

  const confirmSplit = async () => {
    const rects = splitRects;
    const id = splitId;
    if (!id || !rects.length || !docRef.current || splitBusy) return;
    const node = docRef.current.querySelector(
      `[data-editor-id="${CSS.escape(id)}"]`
    );
    const el = elemsRef.current.find((x) => x.id === id);
    if (!node || !el || el.tag !== "image") {
      cancelSplit();
      return;
    }
    setSplitBusy(true);
    try {
      const href = node.getAttribute("href") || node.getAttribute("xlink:href");
      const img = new Image();
      const ok = await new Promise((resolve) => {
        img.onload = () => resolve(true);
        img.onerror = () => resolve(false);
        img.src = href || "";
      });
      if (!ok || !img.naturalWidth) {
        notify("Could not read this image, so it cannot be split");
        return;
      }
      const IW = img.naturalWidth;
      const IH = img.naturalHeight;
      const ox = attrNum(node, "x");
      const oy = attrNum(node, "y");
      const ow = attrNum(node, "width") || IW;
      const oh = attrNum(node, "height") || IH;
      const paint = paintedRect(
        ox,
        oy,
        ow,
        oh,
        IW,
        IH,
        node.getAttribute("preserveAspectRatio")
      );
      if (paint.pw <= 0 || paint.ph <= 0) {
        notify("This image has an empty box, so it cannot be split");
        return;
      }
      const inv = invMat(absMatrixOf(node));
      const ns = "http://www.w3.org/2000/svg";
      const made = [];
      for (const r of rects) {
        // Canvas (viewBox) box -> the image element's own attribute space.
        const corners = [
          [r.x, r.y],
          [r.x + r.w, r.y],
          [r.x + r.w, r.y + r.h],
          [r.x, r.y + r.h],
        ].map(([px, py]) => [
          inv[0] * px + inv[2] * py + inv[4],
          inv[1] * px + inv[3] * py + inv[5],
        ]);
        const lx = Math.min(...corners.map((p) => p[0]));
        const ly = Math.min(...corners.map((p) => p[1]));
        const rx = Math.max(...corners.map((p) => p[0]));
        const ry = Math.max(...corners.map((p) => p[1]));
        // Only the painted area holds pixels; the rest is letterbox air.
        const cx = Math.max(paint.px, lx);
        const cy = Math.max(paint.py, ly);
        const cx1 = Math.min(paint.px + paint.pw, rx);
        const cy1 = Math.min(paint.py + paint.ph, ry);
        if (cx1 - cx < 1 || cy1 - cy < 1) continue;
        // Painted space -> source raster pixels.
        let sx = Math.round((cx - paint.px) / (paint.pw / IW));
        let sy = Math.round((cy - paint.py) / (paint.ph / IH));
        let sw = Math.round((cx1 - cx) / (paint.pw / IW));
        let sh = Math.round((cy1 - cy) / (paint.ph / IH));
        sx = Math.max(0, Math.min(sx, IW - 1));
        sy = Math.max(0, Math.min(sy, IH - 1));
        sw = Math.max(1, Math.min(sw, IW - sx));
        sh = Math.max(1, Math.min(sh, IH - sy));
        const cv = document.createElement("canvas");
        cv.width = sw;
        cv.height = sh;
        cv.getContext("2d").drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);
        let dataUri;
        try {
          dataUri = cv.toDataURL("image/png");
        } catch (err) {
          dataUri = await cropViaFetch(href, sx, sy, sw, sh);
          if (!dataUri) {
            notify(
              "This image's host blocks pixel access (CORS), so it cannot be split"
            );
            return;
          }
        }
        const nid = "I" + uidCounter++;
        const piece = docRef.current.ownerDocument.createElementNS(ns, "image");
        piece.dataset.editorId = nid;
        piece.setAttribute("href", dataUri);
        piece.setAttribute("x", cx);
        piece.setAttribute("y", cy);
        piece.setAttribute("width", cx1 - cx);
        piece.setAttribute("height", cy1 - cy);
        // The box has the same aspect as its raster, so an exact-fit stretch
        // reproduces the pixels where they were on the source image.
        piece.setAttribute("preserveAspectRatio", "none");
        ["transform", "clip-path", "class", "data-group"].forEach((a) => {
          const v = node.getAttribute(a);
          if (v != null) piece.setAttribute(a, v);
        });
        made.push({ nid, piece });
      }
      if (!made.length) {
        notify("Boxes are too small to split — draw a box over each part");
        return;
      }
      mutate(() => {
        made.forEach(({ piece }) => node.before(piece));
        node.remove();
      });
      const ids = made.map((m) => m.nid);
      setSelIds(ids);
      setActiveId(ids[0]);
      cancelSplit();
      notify(
        `Split into ${ids.length} image${
          ids.length > 1 ? "s" : ""
        } — each one moves on its own`
      );
    } finally {
      setSplitBusy(false);
    }
  };

  const removeElement = (id) => {
    const node = docRef.current?.querySelector(`[data-editor-id="${id}"]`);
    if (!node) return;
    mutate(() => node.remove());
    if (id === activeId) setActiveId(null);
    setSelIds((ids) => ids.filter((x) => x !== id));
    notify("Element removed");
  };

  const duplicateElement = (id) => {
    const node = docRef.current?.querySelector(`[data-editor-id="${id}"]`);
    const el = elemsRef.current.find((x) => x.id === id);
    if (!node || !el) return;
    let prefix = "S";
    if (el.tag === "text") {
      prefix = "T";
    } else if (el.tag === "image") {
      prefix = "I";
    }
    const newId = prefix + uidCounter++;
    mutate(() => {
      const clone = node.cloneNode(true);
      clone.dataset.editorId = newId;
      if (el.tag === "text" || el.tag === "image") {
        clone.setAttribute(
          "x",
          Number.parseFloat(node.getAttribute("x") || 0) + 20
        );
        clone.setAttribute(
          "y",
          Number.parseFloat(node.getAttribute("y") || 0) + 20
        );
      }
      node.parentNode?.insertBefore(clone, node.nextSibling);
    });
    setActiveId(newId);
    notify("Element duplicated");
  };

  const zOrder = (id, mode) => {
    const node = docRef.current?.querySelector(`[data-editor-id="${id}"]`);
    if (!node || !node.parentNode) return;
    mutate(() => {
      if (mode === "front") node.parentNode.appendChild(node);
      else if (mode === "back")
        node.parentNode.insertBefore(node, node.parentNode.firstChild);
      else if (mode === "forward") {
        if (node.nextSibling)
          node.parentNode.insertBefore(node.nextSibling, node);
      } else if (mode === "backward") {
        if (node.previousSibling)
          node.parentNode.insertBefore(node, node.previousSibling);
      }
    });
  };

  const alignTo = (mode) => {
    if (!activeEl) return;
    const { w, h } = activeEl;
    let nx = activeEl.x;
    let ny = activeEl.y;
    if (mode === "left") nx = vb.x;
    if (mode === "hcenter") nx = vb.x + (vb.w - w) / 2;
    if (mode === "right") nx = vb.x + vb.w - w;
    if (mode === "top") ny = vb.y;
    if (mode === "vcenter") ny = vb.y + (vb.h - h) / 2;
    if (mode === "bottom") ny = vb.y + vb.h - h;
    const node = docRef.current?.querySelector(
      `[data-editor-id="${activeId}"]`
    );
    if (!node) return;
    mutate(() => {
      setNodePos(node, activeEl, nx, ny);
    });
  };

  const downloadSvg = () => {
    if (!docRef.current) return;
    const str = serialize(docRef.current, true);
    const blob = new Blob([str], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = (templateName.trim() || "certificate-template") + ".svg";
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadPng = () => {
    const img = new Image();
    img.src = svgToDataUri(serialize(docRef.current, true));
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = vb.w;
      canvas.height = vb.h;
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = (templateName.trim() || "certificate-template") + ".png";
        a.click();
        URL.revokeObjectURL(url);
      }, "image/png");
    };
    img.onerror = () =>
      setTemplateError(
        "PNG export failed (probably an external image inside the SVG). Use SVG download."
      );
  };

  const onElementField = (key) => (e) => {
    const value = e.target.value;
    const node = docRef.current?.querySelector(
      `[data-editor-id="${activeId}"]`
    );
    if (!node) return;
    mutate(() => {
      node.setAttribute(key, value);
    });
  };

  const onTextContent = (e) => {
    const value = e.target.value;
    const node = docRef.current?.querySelector(
      `[data-editor-id="${activeId}"]`
    );
    if (!node) return;
    mutate(() => {
      node.textContent = value;
    });
  };

  if (pageLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="60vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!isAdmin) {
    return <Unauthorized />;
  }

  const renderScale = () => {
    if (canvasRef.current) {
      return canvasRef.current.getBoundingClientRect().width / vb.w;
    }
    return 1;
  };

  let canvasCursor = "default";
  if (splitId) {
    canvasCursor = "crosshair";
  } else if (activeEl) {
    canvasCursor = "move";
  }

  const renderInspectorBody = () => {
    if (!activeEl) {
      return (
        <Typography variant="body2" color="text.secondary">
          Click anything to select the smallest element under the
          cursor, Alt+click to select the enclosing group instead.
          Drag to move — a signature or grouped block moves as one,
          and the X / Y fields shift a single part on its own. Drag
          the corners to resize, Shift+click to select many, arrow
          keys to nudge, Ctrl+Z / Ctrl+Shift+Z to undo / redo.
        </Typography>
      );
    }
    if (activeEl.tag === "image" || activeEl.isShape) {
      return (
        <Stack spacing={1.5}>
          <Typography variant="overline" color="text.secondary">
            Move &amp; size
          </Typography>
          <NumericField
            label="X position"
            value={activeEl.x}
            onChange={(v) => patchNodePos({ x: v })}
          />
          <NumericField
            label="Y position"
            value={activeEl.y}
            onChange={(v) => patchNodePos({ y: v })}
          />
          <NumericField
            label="Width"
            value={activeEl.w}
            onChange={(v) => patchEl({ width: v })}
          />
          <NumericField
            label="Height"
            value={activeEl.h}
            onChange={(v) => patchEl({ height: v })}
          />
          {activeEl.mode === "local" ? null : (
            <Typography variant="caption" color="text.secondary">
              Position applied as a transform so the logo keeps its
              original placement inside the template.
            </Typography>
          )}
          <Typography variant="overline" color="text.secondary">
            Look
          </Typography>
          <NumericField
            label="Opacity (0–1)"
            value={activeEl.opacity}
            step={0.05}
            onChange={(v) => patchEl({ opacity: v })}
          />
          {!activeEl.isShape && (
            <Stack direction="row" spacing={1}>
              <Button
                size="small"
                variant="outlined"
                component="label"
                startIcon={<AddPhotoAlternateOutlinedIcon />}
              >
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={replaceImage}
                />
                Replace image
              </Button>
              <Button
                size="small"
                variant="outlined"
                onClick={useNaturalSize}
              >
                Natural size
              </Button>
            </Stack>
          )}
          <Typography variant="overline" color="text.secondary">
            Actions
          </Typography>
          <ZOrderControls
            onOrder={(m) => zOrder(activeEl.id, m)}
            onDuplicate={() => duplicateElement(activeEl.id)}
            onDelete={() => removeElement(activeEl.id)}
          />
        </Stack>
      );
    }
    return (
      <Stack spacing={1.5}>
        <Typography variant="overline" color="text.secondary">
          Content
        </Typography>
        <Box>
          <Typography variant="caption" color="text.secondary">
            Text content
          </Typography>
          <TextField
            fullWidth
            size="small"
            value={activeEl.text}
            onChange={onTextContent}
            multiline
            minRows={2}
          />
        </Box>
        <Typography variant="overline" color="text.secondary">
          Look
        </Typography>
        <NumericField
          label="Font size"
          value={activeEl.fontSize}
          onChange={(v) =>
            onElementField("font-size")({ target: { value: v } })
          }
        />
        <TextField
          label="Font family"
          size="small"
          value={activeEl.fontFamily}
          onChange={onElementField("font-family")}
        />
        <FormControl fullWidth size="small">
          <InputLabel>Font weight</InputLabel>
          <Select
            value={activeEl.fontWeight}
            label="Font weight"
            onChange={onElementField("font-weight")}
          >
            <MenuItem value="normal">Normal</MenuItem>
            <MenuItem value="bold">Bold</MenuItem>
          </Select>
        </FormControl>
        <FormControl fullWidth size="small">
          <InputLabel>Alignment</InputLabel>
          <Select
            value={activeEl.anchor}
            label="Alignment"
            onChange={onElementField("text-anchor")}
          >
            <MenuItem value="start">Left</MenuItem>
            <MenuItem value="middle">Center</MenuItem>
            <MenuItem value="end">Right</MenuItem>
          </Select>
        </FormControl>
        <TextField
          label="Color"
          type="color"
          size="small"
          value={
            /^#[0-9a-f]{6}$/i.test(activeEl.fill || "")
              ? activeEl.fill
              : "#000000"
          }
          onChange={onElementField("fill")}
        />
        <Typography variant="overline" color="text.secondary">
          Actions
        </Typography>
        <ZOrderControls
          onOrder={(m) => zOrder(activeEl.id, m)}
          onDuplicate={() => duplicateElement(activeEl.id)}
          onDelete={() => removeElement(activeEl.id)}
        />
      </Stack>
    );
  };

  return (
    <Container
      maxWidth={embedded ? false : "xl"}
      role="main"
      sx={{
        ...(embedded ? { px: 0, mt: 2 } : {}),
        maxWidth: embedded ? "none" : 1680,
        pb: "3rem",
      }}
      className={
        !embedded ? "xs-pb-20 mt-12 dashboard mt-32 pt-121" : undefined
      }
    >
      {templateError && (
        <Alert
          severity="error"
          sx={{ mb: 2 }}
          onClose={() => setTemplateError(null)}
        >
          {templateError}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={3}>
          <Stack spacing={2}>
            <Card elevation={3}>
              <CardContent>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  mb={1}
                >
                  <Typography variant="subtitle1" fontWeight={600}>
                    Elements{" "}
                    {elems.length > 0 && (
                      <Typography
                        component="span"
                        variant="caption"
                        color="text.secondary"
                      >
                        ({elems.length})
                      </Typography>
                    )}
                  </Typography>
                  <Stack direction="row">
                    <IconButton
                      size="small"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={undoAction}
                      disabled={undo.length === 0}
                      title="Undo (Ctrl+Z)"
                    >
                      <UndoIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={redoAction}
                      disabled={redo.length === 0}
                      title="Redo (Ctrl+Shift+Z)"
                    >
                      <RedoIcon />
                    </IconButton>
                  </Stack>
                </Stack>
                {elems.length === 0 && (
                  <Typography variant="caption" color="text.secondary">
                    No editable elements detected.
                  </Typography>
                )}
                <Box sx={{ maxHeight: 220, overflowY: "auto" }}>
                  <Stack spacing={0.5}>
                    {elems.map((el) => (
                      <Chip
                        key={el.id}
                        size="small"
                        icon={el.isGroup || el.group ? <LinkIcon /> : undefined}
                        label={getElemChipLabel(el)}
                        title={
                          el.isGroup
                            ? "Click to select the whole group, then Ungroup to edit the parts"
                            : undefined
                        }
                        onClick={() => {
                          setSelIds([el.id]);
                          setActiveId(el.id);
                        }}
                        color={el.id === activeId ? "primary" : "default"}
                        variant="outlined"
                        onDelete={
                          el.id === activeId
                            ? () => removeElement(el.id)
                            : undefined
                        }
                      />
                    ))}
                  </Stack>
                </Box>
              </CardContent>
            </Card>
            <Card elevation={3}>
              <CardContent>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                  Inspector
                </Typography>
                {selIds.length > 1 && (
                  <Alert severity="info" sx={{ py: 0.5, mb: 1 }}>
                    {selIds.length} selected — Shift+click to add/remove. Drag
                    moves them all together. Group them to keep moving as one.
                  </Alert>
                )}
                {(activeEl?.isGroup || activeEl?.group) && (
                  <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                    <Chip
                      size="small"
                      icon={<LinkIcon />}
                      label={
                        activeEl?.isGroup
                          ? `Group · ${activeEl.childIds.length} parts`
                          : "In a group"
                      }
                      variant="outlined"
                      color="secondary"
                    />
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={ungroupActive}
                    >
                      Ungroup
                    </Button>
                  </Stack>
                )}
                {selIds.length > 1 && (
                  <Button
                    fullWidth
                    size="small"
                    variant="contained"
                    color="secondary"
                    sx={{ mb: 1 }}
                    onClick={groupSelection}
                  >
                    Group selection as one
                  </Button>
                )}
                {renderInspectorBody()}

                <Divider sx={{ my: 2 }} />
                <Typography variant="caption" color="text.secondary">
                  Align selected to canvas
                </Typography>
                <Stack direction="row" spacing={0.5} mt={0.5} flexWrap="wrap">
                  {[
                    ["Left", "left"],
                    ["H-Center", "hcenter"],
                    ["Right", "right"],
                    ["Top", "top"],
                    ["V-Center", "vcenter"],
                    ["Bottom", "bottom"],
                  ].map(([label, mode]) => (
                    <Button
                      key={mode}
                      size="small"
                      variant="outlined"
                      onClick={() => alignTo(mode)}
                      disabled={!activeEl}
                    >
                      {label}
                    </Button>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          </Stack>
        </Grid>

        <Grid item xs={12} md={9} order={{ xs: 1, md: 2 }}>
          <Card elevation={3}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                <Typography variant="subtitle1" fontWeight={600}>
                  Live Preview
                </Typography>
                <Box flex={1} />
                <FormControl size="small" sx={{ minWidth: 88 }}>
                  <InputLabel id="zoom-label">Zoom</InputLabel>
                  <Select
                    labelId="zoom-label"
                    value={zoom}
                    label="Zoom"
                    onChange={(e) => setZoom(Number(e.target.value))}
                  >
                    <MenuItem value={0}>Fit</MenuItem>
                    <MenuItem value={50}>50%</MenuItem>
                    <MenuItem value={75}>75%</MenuItem>
                    <MenuItem value={100}>100%</MenuItem>
                    <MenuItem value={150}>150%</MenuItem>
                    <MenuItem value={200}>200%</MenuItem>
                  </Select>
                </FormControl>
                <FormControlLabel
                  control={
                    <Switch
                      size="small"
                      checked={showGrid}
                      onChange={(e) => setShowGrid(e.target.checked)}
                    />
                  }
                  label="Grid"
                />
              </Stack>
              <Stack direction="row" spacing={1} mb={1} flexWrap="wrap">
                <Button
                  size="small"
                  variant="contained"
                  color="primary"
                  startIcon={<VisibilityOutlinedIcon />}
                  onClick={() => setPreviewOpen(true)}
                  disabled={!svgStr}
                >
                  Preview
                </Button>
                <Button
                  size="small"
                  variant="contained"
                  startIcon={<TitleIcon />}
                  onClick={addText}
                  disabled={!docRef.current}
                >
                  Add text
                </Button>
                <Button
                  size="small"
                  variant="contained"
                  color="success"
                  component="label"
                  startIcon={<PhotoLibraryOutlinedIcon />}
                  disabled={!docRef.current}
                >
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    hidden
                    onChange={addImages}
                  />
                  Add logos
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<EditNoteIcon />}
                  disabled={!docRef.current}
                  onClick={() => addSignatureBlock()}
                >
                  Signature
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<UploadFileIcon />}
                  onClick={() => setSourceOpen(true)}
                >
                  Source
                </Button>
                {!splitId &&
                  activeEl &&
                  !activeEl.isGroup &&
                  activeEl.tag === "image" && (
                    <Button
                      size="small"
                      variant="outlined"
                      color="warning"
                      startIcon={<ContentCutIcon />}
                      onClick={startSplit}
                    >
                      Split image
                    </Button>
                  )}
                {splitId && (
                  <>
                    <Typography
                      variant="caption"
                      color="warning.main"
                      sx={{ alignSelf: "center" }}
                    >
                      Drag a box over each part ({splitRects.length} drawn) ·
                      click × to drop one
                    </Typography>
                    <Button
                      size="small"
                      onClick={cancelSplit}
                      disabled={splitBusy}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="small"
                      variant="contained"
                      color="warning"
                      onClick={confirmSplit}
                      disabled={!splitRects.length || splitBusy}
                    >
                      Create {splitRects.length} image
                      {splitRects.length === 1 ? "" : "s"}
                    </Button>
                  </>
                )}
              </Stack>
              <Box
                sx={{
                  position: "relative",
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 1,
                  overflow: zoom ? "auto" : "hidden",
                  background:
                    "repeating-conic-gradient(#e8ecf1 0% 25%, #ffffff 0% 50%)",
                  backgroundSize: "22px 22px",
                  cursor: canvasCursor,
                  userSelect: "none",
                }}
                onMouseDown={onCanvasMouseDown}
                onMouseMove={onCanvasMouseMove}
                onMouseUp={onCanvasMouseUp}
                onMouseLeave={onCanvasMouseUp}
              >
                {docRef.current && svgStr && (
                  <Box
                    ref={canvasRef}
                    component="img"
                    src={svgToDataUri(svgStr)}
                    alt="Certificate preview"
                    draggable={false}
                    sx={{
                      width: zoom ? vb.w * (zoom / 100) : "100%",
                      minWidth: zoom ? vb.w * (zoom / 100) : "100%",
                      display: "block",
                      pointerEvents: "none",
                    }}
                  />
                )}
                {!splitId &&
                  selectedNet.length === 1 &&
                  (activeEl?.tag === "image" ||
                    activeEl?.tag === "text" ||
                    activeEl?.isShape) && (
                    <OverlayBox
                      key={activeEl.id}
                      vb={vb}
                      activeEl={activeEl}
                      scale={renderScale()}
                      handles
                    />
                  )}
                {!splitId && selectedNet.length > 1 && (
                  <MultiOverlay
                    vb={vb}
                    box={{
                      x: Math.min(...selectedNet.map((e) => e.x)),
                      y: Math.min(...selectedNet.map((e) => e.y)),
                      w:
                        Math.max(...selectedNet.map((e) => e.x + e.w)) -
                        Math.min(...selectedNet.map((e) => e.x)),
                      h:
                        Math.max(...selectedNet.map((e) => e.y + e.h)) -
                        Math.min(...selectedNet.map((e) => e.y)),
                    }}
                    scale={renderScale()}
                    count={selectedNet.length}
                  />
                )}
                {splitId && splitEl && (
                  <SplitOverlay
                    vb={vb}
                    source={splitEl}
                    rects={splitRects}
                    draft={splitDraft}
                    scale={renderScale()}
                    onRemoveRect={(i) =>
                      setSplitRects((s) => s.filter((_, k) => k !== i))
                    }
                  />
                )}
                {showGrid && docRef.current && (
                  <Box
                    sx={{
                      position: "absolute",
                      inset: 0,
                      pointerEvents: "none",
                      zIndex: 10,
                      backgroundImage: `repeating-linear-gradient(0deg, rgba(25,118,210,0.14) 0 1px, transparent 1px ${Math.max(
                        20,
                        50 * renderScale()
                      )}px), repeating-linear-gradient(90deg, rgba(25,118,210,0.14) 0 1px, transparent 1px ${Math.max(
                        20,
                        50 * renderScale()
                      )}px)`,
                    }}
                  />
                )}
                {!docRef.current && (
                  <Box
                    display="flex"
                    flexDirection="column"
                    alignItems="center"
                    justifyContent="center"
                    minHeight={420}
                    color="text.secondary"
                  >
                    <WorkspacePremiumOutlinedIcon
                      sx={{ fontSize: 48, mb: 1 }}
                    />
                    <Typography variant="body2">
                      Load a template or upload an SVG to start editing.
                    </Typography>
                  </Box>
                )}
              </Box>
              <Stack direction="row" spacing={1} mt={2}>
                <Button
                  variant="contained"
                  startIcon={<DownloadIcon />}
                  onClick={downloadSvg}
                  disabled={!docRef.current}
                >
                  Download SVG
                </Button>
                <Button
                  variant="outlined"
                  onClick={downloadPng}
                  disabled={!docRef.current}
                >
                  Download PNG
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Dialog
        open={sourceOpen}
        onClose={() => setSourceOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle
          sx={{ display: "flex", alignItems: "center", gap: 1, py: 1.5 }}
        >
          <UploadFileIcon color="primary" />
          <Typography variant="h6" fontWeight={600} flex={1}>
            Certificate Source
          </Typography>
          <IconButton
            onClick={() => setSourceOpen(false)}
            aria-label="close"
            size="small"
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {templateError && (
            <Alert
              severity="error"
              sx={{ mb: 2 }}
              onClose={() => setTemplateError(null)}
            >
              {templateError}
            </Alert>
          )}
          <Button
            component="label"
            variant="outlined"
            fullWidth
            startIcon={<UploadFileIcon />}
          >
            <input
              type="file"
              accept=".svg,image/svg+xml"
              hidden
              onChange={handleUpload}
            />
            Upload SVG
          </Button>
          <Divider sx={{ my: 2 }}>
            <Typography variant="caption" color="text.secondary">
              or pick an existing one
            </Typography>
          </Divider>
          <TextField
            fullWidth
            size="small"
            placeholder="Search course"
            value={courseQuery}
            onChange={(e) => setCourseQuery(e.target.value)}
            sx={{ mb: 1 }}
          />
          {searchingCourses && (
            <Box display="flex" justifyContent="center" py={1}>
              <CircularProgress size={20} />
            </Box>
          )}
          <Box sx={{ maxHeight: 200, overflowY: "auto" }}>
            {courseResults.slice(0, 10).map((c) => (
              <Chip
                key={c.identifier}
                label={c.name}
                size="small"
                onClick={() => pickCourse(c)}
                color={
                  selectedCourse?.identifier === c.identifier
                    ? "primary"
                    : "default"
                }
                variant={
                  selectedCourse?.identifier === c.identifier
                    ? "filled"
                    : "outlined"
                }
                sx={{ mr: 0.5, mb: 0.5, maxWidth: "100%" }}
              />
            ))}
          </Box>
          {loadingBatches && (
            <Box display="flex" justifyContent="center" py={1}>
              <CircularProgress size={20} />
            </Box>
          )}
          {batches.length > 0 && (
            <FormControl fullWidth size="small" sx={{ mt: 1 }}>
              <InputLabel>Batch</InputLabel>
              <Select
                value={selectedBatchId}
                onChange={(e) => pickBatch(e.target.value)}
                label="Batch"
              >
                {batches.map((b) => (
                  <MenuItem key={b.batchId} value={b.batchId}>
                    {b.batchId}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
          {templates.length > 0 && (
            <FormControl fullWidth size="small" sx={{ mt: 1 }}>
              <InputLabel>Certificate Template</InputLabel>
              <Select
                value={selectedTemplateId}
                onChange={(e) => pickTemplate(e.target.value)}
                label="Certificate Template"
              >
                {templates.map((t) => (
                  <MenuItem key={t.id} value={t.id}>
                    {t.name || t.id}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
          {loadingTemplate && (
            <Box display="flex" justifyContent="center" py={2}>
              <CircularProgress size={24} />
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ py: 1.5, justifyContent: "center" }}>
          <Button onClick={() => setSourceOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        fullScreen
        PaperProps={{ sx: { bgcolor: "#4a4f57", m: 0 } }}
      >
        <DialogTitle
          sx={{
            color: "#fff",
            display: "flex",
            alignItems: "center",
            gap: 1,
            py: 1.5,
          }}
        >
          <VisibilityOutlinedIcon />
          <Typography variant="h6" fontWeight={600} flex={1}>
            Certificate Preview
          </Typography>
          <IconButton
            onClick={() => setPreviewOpen(false)}
            sx={{ color: "#fff" }}
            aria-label="close"
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            p: 2,
          }}
        >
          <Box
            sx={{
              bgcolor: "#fff",
              borderRadius: 1,
              boxShadow: "0 12px 40px rgba(0,0,0,0.45)",
              // The certificate SVG carries only a viewBox, so the image has
              // no intrinsic width/height. With width/height: auto inside a
              // flex DialogContent the box collapses to 0x0 (blank preview).
              // Give the frame a definite size instead: never wider than the
              // dialog and never taller than the height budget, preserving
              // the certificate's aspect ratio.
              width: `min(100%, calc((100vh - 190px) * ${
                vb.h ? vb.w / vb.h : 1.414
              }))`,
              maxWidth: "100%",
              overflow: "auto",
            }}
          >
            <Box
              component="img"
              src={svgToDataUri(svgStr)}
              alt="Certificate preview"
              sx={{
                display: "block",
                width: "100%",
                height: "auto",
                aspectRatio: `${vb.w} / ${vb.h || vb.w}`,
                maxWidth: "100%",
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ py: 1.5, justifyContent: "center" }}>
          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            onClick={downloadSvg}
          >
            Download SVG
          </Button>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={downloadPng}
            sx={{ color: "#fff", borderColor: "rgba(255,255,255,0.5)" }}
          >
            Download PNG
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={!!toast}
        autoHideDuration={2600}
        onClose={() => setToast("")}
        message={toast}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      />
    </Container>
  );
};

const NumericField = ({ label, value, onChange, step = 1 }) => (
  <TextField
    label={label}
    type="number"
    size="small"
    value={Number(value) || 0}
    step={step}
    onChange={(e) => onChange(Number.parseFloat(e.target.value) || 0)}
  />
);

const ZOrderControls = ({ onOrder, onDuplicate, onDelete }) => (
  <Stack direction="row" spacing={0.5} flexWrap="wrap">
    <Tooltip title="Bring to front">
      <IconButton size="small" onClick={() => onOrder("front")}>
        <ArrowUpwardIcon />
      </IconButton>
    </Tooltip>
    <Tooltip title="Send to back">
      <IconButton size="small" onClick={() => onOrder("back")}>
        <ArrowDownwardIcon />
      </IconButton>
    </Tooltip>
    <Tooltip title="Duplicate">
      <IconButton size="small" onClick={onDuplicate}>
        <ContentCopyIcon />
      </IconButton>
    </Tooltip>
    <Tooltip title="Delete">
      <IconButton size="small" color="error" onClick={onDelete}>
        <DeleteOutlineIcon />
      </IconButton>
    </Tooltip>
  </Stack>
);

const CAST_HANDLES = ["nw", "n", "ne", "e", "se", "s", "sw", "w"];

const OverlayBox = ({ vb, activeEl, scale, handles = false }) => {
  const left = (activeEl.x - vb.x) * scale;
  const top = (activeEl.y - vb.y) * scale;
  const width = Math.min(activeEl.w * scale + 8, vb.w * scale);
  const height = Math.min(activeEl.h * scale + 8, vb.h * scale);
  let label = SHAPE_LABELS[activeEl.kind] || activeEl.kind || "Element";
  if (activeEl.tag === "text") {
    label = (activeEl.text || "Text").slice(0, 16) || "Text";
  } else if (activeEl.tag === "image") {
    label = "Image";
  }
  const placeAbove = top - 18 > 0;
  const hk = {
    nw: [0, 0],
    n: [width / 2 - 4, 0],
    ne: [width - 8, 0],
    e: [width - 8, height / 2 - 4],
    se: [width - 8, height - 8],
    s: [width / 2 - 4, height - 8],
    sw: [0, height - 8],
    w: [0, height / 2 - 4],
  };
  return (
    <Box
      sx={{
        position: "absolute",
        left: Math.max(0, left - 4),
        top: Math.max(0, top - 4),
        width,
        height,
        border: "2px dashed #1976d2",
        borderRadius: 1,
        pointerEvents: "none",
        zIndex: 20,
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: placeAbove ? -20 : 4,
          left: 6,
          maxWidth: 220,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          bgcolor: "#1976d2",
          color: "#fff",
          fontSize: 10,
          lineHeight: "14px",
          px: 0.75,
          borderRadius: 0.5,
          fontWeight: 600,
          textTransform: "uppercase",
        }}
      >
        {label}
      </Box>
      {handles &&
        CAST_HANDLES.map((k) => (
          <Box
            key={k}
            sx={{
              position: "absolute",
              left: hk[k][0],
              top: hk[k][1],
              width: 8,
              height: 8,
              bgcolor: "#fff",
              border: "1.5px solid #1976d2",
              borderRadius: 0.5,
            }}
          />
        ))}
    </Box>
  );
};

const MultiOverlay = ({ vb, box, scale, count }) => {
  const left = (box.x - vb.x) * scale;
  const top = (box.y - vb.y) * scale;
  return (
    <Box
      sx={{
        position: "absolute",
        left: Math.max(0, left - 4),
        top: Math.max(0, top - 4),
        width: Math.min(box.w * scale + 8, vb.w * scale),
        height: Math.min(box.h * scale + 8, vb.h * scale),
        border: "2px dashed #388e3c",
        borderRadius: 1,
        pointerEvents: "none",
        zIndex: 20,
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: top - 4 > 0 ? -20 : 4,
          left: 6,
          bgcolor: "#388e3c",
          color: "#fff",
          fontSize: 10,
          lineHeight: "14px",
          px: 0.75,
          borderRadius: 0.5,
          fontWeight: 600,
          textTransform: "uppercase",
        }}
      >
        {count} selected
      </Box>
    </Box>
  );
};

// Crop-box layer for split mode: outlines the source image, shows each
// confirmed box (removable via its ×) and the box currently being dragged.
const SplitOverlay = ({ vb, source, rects, draft, scale, onRemoveRect }) => {
  const boxOf = (r) => ({
    position: "absolute",
    left: (r.x - vb.x) * scale,
    top: (r.y - vb.y) * scale,
    width: Math.max(0, r.w * scale),
    height: Math.max(0, r.h * scale),
    boxSizing: "border-box",
  });
  return (
    <>
      <Box
        sx={{
          ...boxOf(source),
          border: "2px solid #ed6c02",
          borderRadius: 1,
          pointerEvents: "none",
          zIndex: 21,
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: -18,
            left: 0,
            bgcolor: "#ed6c02",
            color: "#fff",
            fontSize: 10,
            lineHeight: "14px",
            px: 0.75,
            borderRadius: 0.5,
            fontWeight: 600,
            textTransform: "uppercase",
            whiteSpace: "nowrap",
          }}
        >
          Splitting
        </Box>
      </Box>
      {rects.map((r, i) => (
        <Box
          key={r.id || `rect-${r.x}-${r.y}-${r.w}-${r.h}-${i}`}
          sx={{
            ...boxOf(r),
            border: "2px solid #2e7d32",
            bgcolor: "rgba(46,125,50,0.14)",
            borderRadius: 0.5,
            zIndex: 22,
          }}
        >
          <Box
            sx={{
              position: "absolute",
              top: -16,
              left: 0,
              bgcolor: "#2e7d32",
              color: "#fff",
              fontSize: 10,
              lineHeight: "14px",
              px: 0.75,
              borderRadius: "4px 4px 0 0",
              fontWeight: 700,
              pointerEvents: "none",
            }}
          >
            {i + 1}
          </Box>
          <IconButton
            size="small"
            aria-label={`Drop crop ${i + 1}`}
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              onRemoveRect(i);
            }}
            sx={{
              position: "absolute",
              right: -10,
              top: -10,
              width: 20,
              height: 20,
              bgcolor: "#2e7d32",
              color: "#fff",
              "&:hover": { bgcolor: "#1b5e20" },
              zIndex: 1,
            }}
          >
            <CloseIcon sx={{ fontSize: 13 }} />
          </IconButton>
        </Box>
      ))}
      {draft && (
        <Box
          sx={{
            ...boxOf(draft),
            border: "2px dashed #ed6c02",
            bgcolor: "rgba(237,108,2,0.10)",
            borderRadius: 0.5,
            pointerEvents: "none",
            zIndex: 23,
          }}
        />
      )}
    </>
  );
};

const CertificateEditor = () => (
  <div>
    <Header />
    <CertificateEditorPanel />
    <Footer />
  </div>
);

export default CertificateEditor;
export { CertificateEditorPanel };
