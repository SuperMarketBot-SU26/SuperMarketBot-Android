import re

file_path = 'src/components/map/MapScreenMain.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Remove imports
content = re.sub(r"import WebView from 'react-native-webview';\n", "", content)
content = re.sub(r"import \{ MAP_HTML \} from './mapHtml';\n", "", content)

# Remove WebView Refs
content = re.sub(r"  // WebView Refs\n  const previewWebViewRef = useRef<any>\(null\);\n  const modalWebViewRef = useRef<any>\(null\);\n", "", content)

# Remove jumpRobotToNode calls
content = re.sub(r"        const jsCode = if \(window\.jumpRobotToNode\) \{ window\.jumpRobotToNode\(\$\{node\.x\}, \$\{node\.y\}\); \} true;;\n        previewWebViewRef\.current\?\.injectJavaScript\(jsCode\);\n        modalWebViewRef\.current\?\.injectJavaScript\(jsCode\);", "", content)

# Remove handleWebViewMessage
content = re.sub(r"  // Handle WebView message \(NODE_CLICKED, MAP_READY\)\n  const handleWebViewMessage = useCallback\(\(event: any\) => \{\n.*?  // eslint-disable-next-line react-hooks/exhaustive-deps\n  \}, \[isRobotMoving\]\);\n", "", content, flags=re.DOTALL)

# Remove sendRouteToWebViews
content = re.sub(r"  const sendRouteToWebViews = \(\) => \{\n.*?    modalWebViewRef\.current\?\.injectJavaScript\(jsCode\);\n  \};\n", "", content, flags=re.DOTALL)

# Remove useEffect that calls sendRouteToWebViews
content = re.sub(r"  useEffect\(\(\) => \{\n    if \(routePoints\.length > 0 \|\| pins\.length > 0\) \{\n      sendRouteToWebViews\(\);\n      const timer = setTimeout\(sendRouteToWebViews, 800\);\n      return \(\) => clearTimeout\(timer\);\n    \}\n  \}, \[routePoints, pins\]\);\n", "", content)

# Replace WebView in preview
content = re.sub(r"<WebView\n.*?onMessage=\{handleWebViewMessage\}\n\s+/>", "{renderMapContent(CANVAS_SIZE, false)}", content, flags=re.DOTALL)

# Replace WebView in modal
content = re.sub(r"<WebView\n.*?onMessage=\{handleWebViewMessage\}\n\s+/>", "<ScrollView horizontal maximumZoomScale={3} minimumZoomScale={1} centerContent><View style={{ padding: 20 }}>{renderMapContent(width * 1.5, true)}</View></ScrollView>", content, flags=re.DOTALL)


with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print('Done!')
