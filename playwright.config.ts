import { defineConfig } from '@playwright/test';
export default defineConfig({testDir:'tests/browser',timeout:120000,expect:{timeout:5000},fullyParallel:false,workers:1,reporter:'list',use:{baseURL:'http://127.0.0.1:5225',headless:true,viewport:{width:1280,height:900}},webServer:{command:'npm run preview',url:'http://127.0.0.1:5225',reuseExistingServer:true,timeout:30000}});
