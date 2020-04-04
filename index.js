#!/usr/bin/env node

// 使用node开发命令行工具所执行的js脚本必须在顶部加入 #!/usr/bin/env node 生命
// #!/usr/bin/env node  告诉系统该脚本使用node运行，用户必须在系统变量中配置了node

const program = require('commander');

// 下载github仓库
const download = require('download-git-repo');

// 命令行交互
const inquirer = require('inquirer');

// 处理模板
const handlebars = require('handlebars');

// loading效果
const ora = require('ora');

// 给字体增加颜色
const chalk = require('chalk');

const fs = require('fs');

const path = require('path');

// 1、获取用户输入的命令
// 原生获取命令行
// console.log(process.argv)

// 模板
// zaigithub上用https方式下载
const downloadUrl = 'direct:https://github.com/c10342/react-multipage-template.git';
const packageStr = fs.readFileSync(path.join(__dirname,'./package.json'),'utf-8');
const version = JSON.parse(packageStr).version;
program
    .version(version, '-v, --version');

program
    .command('create <project>')
    .description('初始化项目模板')
    .action(function (projectName) {
        // 与用户交互
        inquirer
            .prompt([
                {
                    type: 'input',
                    name: 'name',
                    message: '请输入项目名称：'
                },
                {
                    type: 'input',
                    name: 'description',
                    message: '请输入项目描述：'
                },
                {
                    type: 'input',
                    name: 'author',
                    message: '请输入项目作者：'
                },
                {
                    type: 'confirm',
                    name: 'cssStyle',
                    message: '是否使用less/node-sass：'
                },
                {
                    type: 'list',
                    message: '请选择以下css预处理器:',
                    name: 'preprocessor',
                    choices: [
                        "less",
                        "sass"
                    ],
                    when: function (answers) { // 当watch为true的时候才会提问当前问题
                        return answers.cssStyle
                    }
                }
            ])
            .then(answers => {
                let params = {
                    name: answers.name,
                    description: answers.description,
                    author: answers.author
                }
                if (answers.cssStyle) {
                    if (answers.preprocessor === 'less') {
                        params.less = true;
                        params.sass = false;
                    } else if (answers.preprocessor === 'sass') {
                        params.less = false;
                        params.sass = true;
                    }
                } else {
                    params.sass = false;
                    params.less = false
                }
                console.log("");
                // 根据模板名下载对应的模板到本地
                var spinner = ora('正在下载中...').start();

                download(downloadUrl, projectName, { clone: true }, err => {
                    if (err) {
                        console.log(err);
                        spinner.text = '下载失败';
                        spinner.fail()  //下载失败
                    } else {
                        let packagePath = `${projectName}/package.json`;
                        let packageStr = fs.readFileSync(packagePath, 'utf-8');
                        let package = handlebars.compile(packageStr)(params);
                        fs.writeFileSync(packagePath, package);
                        if (params.sass) {
                            const npmrcPath = `${projectName}/.npmrc`;
                            const appendContent = '\r\nsass_binary_site=https://npm.taobao.org/mirrors/node-sass/'
                            if (!fs.existsSync(npmrcPath)) {
                                fs.writeFileSync(npmrcPath, appendContent)
                            } else {
                                fs.appendFileSync(npmrcPath, appendContent)
                            }
                        }

                        spinner.text = '下载成功';
                        spinner.color = '#13A10E';
                        spinner.succeed();
                        console.log("");
                        console.log(" # cd into Project");
                        console.log(chalk.gray('   $ ') + chalk.blue(`cd ${projectName}`));
                        console.log("");
                        console.log(" # Project setup");
                        console.log(chalk.gray('   $ ') + chalk.blue(`npm install`));
                        console.log("");
                        console.log(" # Compiles and hot-reloads for development");
                        console.log(chalk.gray('   $ ') + chalk.blue(`npm run dev`));
                        console.log("");
                        console.log(" # Compiles and minifies for production");
                        console.log(chalk.gray('   $ ') + chalk.blue(`npm run build`));
                        console.log("")
                    }
                })
            });
    });


program.parse(process.argv);




// 2、根据不同命令执行不同操作