#创建命令
lin  create  lin-demo

<p>lin  --help  查看使用帮助</p>
<p>lin  --version | -v  查看工具版本</p>
<p>lin  create  <project-name>  基于指定的模板进行项目初始化</p>


1、初始化项目 npm init -y

2、在package.json中添加字段
"bin": {
    "lin": "index.js"
} 
index.js  是要执行的文件

3、把命令映射到全局
npm link (npm unlink  解除映射)