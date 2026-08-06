import re

file_path = 'src/components/map/MapScreenMain.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Remove the jumpRobotToNode logic
content = re.sub(r"        const jsCode = if \(window\.jumpRobotToNode\) \{ window\.jumpRobotToNode\(\$\{node\.x\}, \$\{node\.y\}\); \} true;;\n        previewWebViewRef\.current\?\.injectJavaScript\(jsCode\);\n        modalWebViewRef\.current\?\.injectJavaScript\(jsCode\);", "", content)

# Remove the empty block and the jsCode definition if left over
content = re.sub(r"      if \(node\) \{\n\n      \}", "", content)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print('Done MapScreenMain!')
