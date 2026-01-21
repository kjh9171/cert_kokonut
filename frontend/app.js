const API_URL = 'http://localhost:3000/api';

const app = {
    state: {
        currentTab: 'overview',
        timeFilter: 'monthly',
        transactions: [],
        auditLogs: [],
        charts: {},
        deleteTargetId: null
    },

    handlers: {
        // Login
        showLogin: () => {
            document.getElementById('modal-login').classList.remove('hidden');
        },
        closeLogin: () => {
            document.getElementById('modal-login').classList.add('hidden');
        },
        verifyCredentials: async () => {
            const username = document.getElementById('input-id').value;
            const password = document.getElementById('input-pw').value;

            try {
                const response = await fetch(`${API_URL}/auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password })
                });

                const result = await response.json();
                if (result.success) {
                    document.getElementById('login-step-1').classList.add('hidden');
                    document.getElementById('login-step-2').classList.remove('hidden');
                } else {
                    alert('로그인 실패: ' + result.message);
                }
            } catch (error) {
                alert('서버 연결 실패');
            }
        },
        backToLogin: () => {
            document.getElementById('login-step-1').classList.remove('hidden');
            document.getElementById('login-step-2').classList.add('hidden');
        },
        verifyMFA: async () => {
            const token = document.getElementById('input-mfa').value;

            try {
                const response = await fetch(`${API_URL}/auth/mfa-verify`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ token })
                });

                const result = await response.json();
                if (result.success) {
                    document.getElementById('modal-login').classList.add('hidden');
                    document.getElementById('view-landing').classList.add('hidden');
                    document.getElementById('view-dashboard').classList.remove('hidden');
                    app.logic.loadData();
                } else {
                    alert('MFA 인증 실패: ' + result.message);
                }
            } catch (error) {
                alert('서버 연결 실패');
            }
        },
        logout: () => {
            location.reload();
        },

        // Navigation
        switchTab: (tabName) => {
            app.state.currentTab = tabName;

            // Update nav buttons
            ['overview', 'transactions', 'analysis', 'audit'].forEach(tab => {
                const btn = document.getElementById(`nav-${tab}`);
                const view = document.getElementById(`tab-${tab}`);

                if (tab === tabName) {
                    btn.classList.remove('text-gray-500', 'hover:bg-gray-50');
                    btn.classList.add('text-brand-900', 'bg-brand-100');
                    view.classList.remove('hidden');
                } else {
                    btn.classList.add('text-gray-500', 'hover:bg-gray-50');
                    btn.classList.remove('text-brand-900', 'bg-brand-100');
                    view.classList.add('hidden');
                }
            });

            // Update title
            const titles = {
                overview: '대시보드',
                transactions: '거래 내역',
                analysis: 'AI 재무 분석',
                audit: '감사 로그'
            };
            document.getElementById('page-title').innerText = titles[tabName];

            // Load data for specific tabs
            if (tabName === 'audit') {
                app.logic.loadAuditLogs();
            }
        },

        setTimeFilter: (filter) => {
            app.state.timeFilter = filter;

            document.querySelectorAll('.filter-btn').forEach(btn => {
                if (btn.dataset.filter === filter) {
                    btn.classList.remove('text-gray-500');
                    btn.classList.add('bg-white', 'text-brand-900', 'shadow-sm');
                } else {
                    btn.classList.add('text-gray-500');
                    btn.classList.remove('bg-white', 'text-brand-900', 'shadow-sm');
                }
            });

            app.render.dashboard();
        },

        // Transaction Modals
        openAddModal: () => {
            document.getElementById('modal-add-tx').classList.remove('hidden');
            document.getElementById('add-date').valueAsDate = new Date();
        },
        closeAddModal: () => {
            document.getElementById('modal-add-tx').classList.add('hidden');
        },
        submitTransaction: async (event) => {
            event.preventDefault();

            const data = {
                date: document.getElementById('add-date').value,
                type: document.getElementById('add-type').value,
                category: document.getElementById('add-category').value,
                amount: document.getElementById('add-amount').value,
                description: document.getElementById('add-description').value
            };

            try {
                const response = await fetch(`${API_URL}/transactions`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });

                if (response.ok) {
                    alert('거래가 암호화되어 저장되었습니다.');
                    app.handlers.closeAddModal();
                    app.logic.loadData();
                }
            } catch (error) {
                alert('저장 실패');
            }
        },

        // CSV Upload
        openCSVModal: () => {
            document.getElementById('modal-csv').classList.remove('hidden');
            app.logic.setupDropzone();
        },
        closeCSVModal: () => {
            document.getElementById('modal-csv').classList.add('hidden');
            document.getElementById('csv-progress').classList.add('hidden');
            document.getElementById('csv-result').classList.add('hidden');
        },

        // Delete
        openDeleteModal: (id) => {
            app.state.deleteTargetId = id;
            document.getElementById('modal-delete').classList.remove('hidden');
        },
        closeDeleteModal: () => {
            document.getElementById('modal-delete').classList.add('hidden');
            app.state.deleteTargetId = null;
        },
        confirmDelete: async () => {
            const reason = document.getElementById('delete-reason').value;

            try {
                const response = await fetch(`${API_URL}/transactions/${app.state.deleteTargetId}`, {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ reason, adminUser: 'admin' })
                });

                if (response.ok) {
                    alert('거래가 삭제되었으며 감사 로그에 기록되었습니다.');
                    app.handlers.closeDeleteModal();
                    app.logic.loadData();
                }
            } catch (error) {
                alert('삭제 실패');
            }
        },

        // AI Analysis
        runAIAnalysis: async () => {
            const btn = document.getElementById('btn-ai-analyze');
            btn.disabled = true;
            btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> 분석 중...';

            try {
                const response = await fetch(`${API_URL}/transactions/analyze`, {
                    method: 'POST'
                });

                const result = await response.json();
                if (result.success) {
                    app.render.aiResults(result.analysis);
                    document.getElementById('ai-results').classList.remove('hidden');
                }
            } catch (error) {
                alert('AI 분석 실패');
            } finally {
                btn.disabled = false;
                btn.innerHTML = '<i class="fa-solid fa-brain"></i> AI 분석 실행';
            }
        }
    },

    logic: {
        loadData: async () => {
            try {
                const response = await fetch(`${API_URL}/transactions`);
                app.state.transactions = await response.json();
                app.render.dashboard();
                app.render.transactionTable();
            } catch (error) {
                console.error('데이터 로드 실패:', error);
            }
        },

        loadAuditLogs: async () => {
            try {
                const response = await fetch(`${API_URL}/audit-logs`);
                app.state.auditLogs = await response.json();
                app.render.auditTable();
            } catch (error) {
                console.error('감사 로그 로드 실패:', error);
            }
        },

        filterDataByTime: (data) => {
            const now = new Date();
            const filter = app.state.timeFilter;

            return data.filter(tx => {
                const txDate = new Date(tx.date);

                if (filter === 'daily') {
                    const sevenDaysAgo = new Date(now);
                    sevenDaysAgo.setDate(now.getDate() - 7);
                    return txDate >= sevenDaysAgo;
                }
                if (filter === 'monthly') {
                    return txDate.getMonth() === now.getMonth() &&
                        txDate.getFullYear() === now.getFullYear();
                }
                if (filter === 'quarterly') {
                    const currentQ = Math.floor(now.getMonth() / 3);
                    const txQ = Math.floor(txDate.getMonth() / 3);
                    return currentQ === txQ && txDate.getFullYear() === now.getFullYear();
                }
                if (filter === 'yearly') {
                    return txDate.getFullYear() === now.getFullYear();
                }
                return true;
            });
        },

        calculateKPIs: (data) => {
            return data.reduce((acc, curr) => {
                if (curr.type === 'income') acc.income += curr.amount;
                else acc.expense += curr.amount;
                return acc;
            }, { income: 0, expense: 0 });
        },

        setupDropzone: () => {
            const dropzone = document.getElementById('dropzone');
            const fileInput = document.getElementById('csv-file-input');

            dropzone.onclick = () => fileInput.click();

            dropzone.ondragover = (e) => {
                e.preventDefault();
                dropzone.classList.add('dragover');
            };

            dropzone.ondragleave = () => {
                dropzone.classList.remove('dragover');
            };

            dropzone.ondrop = (e) => {
                e.preventDefault();
                dropzone.classList.remove('dragover');
                const file = e.dataTransfer.files[0];
                if (file) app.logic.uploadCSV(file);
            };

            fileInput.onchange = (e) => {
                const file = e.target.files[0];
                if (file) app.logic.uploadCSV(file);
            };
        },

        uploadCSV: async (file) => {
            const formData = new FormData();
            formData.append('file', file);

            document.getElementById('csv-progress').classList.remove('hidden');
            document.getElementById('csv-progress-bar').style.width = '50%';

            try {
                const response = await fetch(`${API_URL}/transactions/upload-csv`, {
                    method: 'POST',
                    body: formData
                });

                const result = await response.json();

                document.getElementById('csv-progress-bar').style.width = '100%';

                setTimeout(() => {
                    document.getElementById('csv-progress').classList.add('hidden');

                    const resultDiv = document.getElementById('csv-result');
                    resultDiv.classList.remove('hidden');

                    if (result.success) {
                        resultDiv.className = 'mt-4 p-4 rounded-lg bg-green-50 border border-green-200';
                        resultDiv.innerHTML = `
                            <p class="text-green-800 font-bold">✓ 업로드 성공</p>
                            <p class="text-sm text-green-600 mt-1">총 ${result.total}건 중 ${result.imported}건 저장됨</p>
                        `;

                        setTimeout(() => {
                            app.handlers.closeCSVModal();
                            app.logic.loadData();
                        }, 2000);
                    } else {
                        resultDiv.className = 'mt-4 p-4 rounded-lg bg-red-50 border border-red-200';
                        resultDiv.innerHTML = `<p class="text-red-800 font-bold">✗ 업로드 실패</p>`;
                    }
                }, 500);
            } catch (error) {
                alert('CSV 업로드 실패');
            }
        }
    },

    render: {
        dashboard: () => {
            const filtered = app.logic.filterDataByTime(app.state.transactions);
            const kpis = app.logic.calculateKPIs(filtered);

            document.getElementById('kpi-income').innerText = `₩${kpis.income.toLocaleString('ko-KR')}`;
            document.getElementById('kpi-expense').innerText = `₩${kpis.expense.toLocaleString('ko-KR')}`;
            document.getElementById('kpi-balance').innerText = `₩${(kpis.income - kpis.expense).toLocaleString('ko-KR')}`;
            document.getElementById('kpi-savings').innerText = `₩${(kpis.income - kpis.expense).toLocaleString('ko-KR')}`;

            app.render.trendChart(filtered);
            app.render.categoryChart(filtered);
        },

        trendChart: (data) => {
            const ctx = document.getElementById('chart-trend');
            if (!ctx) return;

            if (app.state.charts.trend) app.state.charts.trend.destroy();

            const grouped = {};
            data.forEach(tx => {
                const key = tx.date.substring(0, 10);
                if (!grouped[key]) grouped[key] = { income: 0, expense: 0 };
                grouped[key][tx.type] += tx.amount;
            });

            const labels = Object.keys(grouped).sort();
            const incomeData = labels.map(l => grouped[l].income);
            const expenseData = labels.map(l => grouped[l].expense);

            app.state.charts.trend = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: labels.map(l => l.substring(5)),
                    datasets: [
                        {
                            label: '수입',
                            data: incomeData,
                            borderColor: '#10b981',
                            backgroundColor: 'rgba(16, 185, 129, 0.1)',
                            fill: true,
                            tension: 0.4
                        },
                        {
                            label: '지출',
                            data: expenseData,
                            borderColor: '#f43f5e',
                            backgroundColor: 'rgba(244, 63, 94, 0.05)',
                            fill: true,
                            tension: 0.4
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { position: 'top' }
                    },
                    scales: {
                        y: { beginAtZero: true }
                    }
                }
            });
        },

        categoryChart: (data) => {
            const ctx = document.getElementById('chart-category');
            if (!ctx) return;

            if (app.state.charts.category) app.state.charts.category.destroy();

            const expenseData = data.filter(d => d.type === 'expense');
            const grouped = {};
            expenseData.forEach(tx => {
                grouped[tx.category] = (grouped[tx.category] || 0) + tx.amount;
            });

            app.state.charts.category = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: Object.keys(grouped),
                    datasets: [{
                        data: Object.values(grouped),
                        backgroundColor: ['#f87171', '#fb923c', '#facc15', '#a78bfa', '#60a5fa', '#34d399'],
                        borderWidth: 0
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    cutout: '70%',
                    plugins: {
                        legend: { position: 'right' }
                    }
                }
            });
        },

        transactionTable: () => {
            const tbody = document.getElementById('transaction-table-body');
            if (!tbody) return;

            tbody.innerHTML = '';

            app.state.transactions.slice(0, 50).forEach(tx => {
                const tr = document.createElement('tr');
                tr.className = "hover:bg-gray-50 transition-colors";

                const amountColor = tx.type === 'income' ? 'text-income' : 'text-expense';
                const sign = tx.type === 'income' ? '+' : '-';

                tr.innerHTML = `
                    <td class="p-4 text-gray-500">${new Date(tx.date).toLocaleDateString('ko-KR')}</td>
                    <td class="p-4">
                        <span class="px-2 py-1 rounded-md text-xs font-medium ${tx.type === 'income' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}">
                            ${tx.category}
                        </span>
                    </td>
                    <td class="p-4 text-gray-800">${tx.description}</td>
                    <td class="p-4 text-right font-bold ${amountColor}">${sign} ₩${tx.amount.toLocaleString('ko-KR')}</td>
                    <td class="p-4 text-center">
                        <button onclick="app.handlers.openDeleteModal(${tx.id})" class="text-red-400 hover:text-red-600 transition">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        },

        auditTable: () => {
            const tbody = document.getElementById('audit-table-body');
            if (!tbody) return;

            tbody.innerHTML = '';

            app.state.auditLogs.forEach(log => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td class="p-4 text-gray-500">${new Date(log.timestamp).toLocaleString('ko-KR')}</td>
                    <td class="p-4">
                        <span class="px-2 py-1 rounded-md text-xs font-medium bg-red-50 text-red-700">
                            ${log.action_type}
                        </span>
                    </td>
                    <td class="p-4 text-gray-600">#${log.target_id}</td>
                    <td class="p-4 text-gray-800 font-medium">${log.admin_user}</td>
                    <td class="p-4 text-gray-600">${log.reason || '-'}</td>
                `;
                tbody.appendChild(tr);
            });
        },

        aiResults: (analysis) => {
            document.getElementById('ai-summary').innerText = analysis.summary;
            document.getElementById('ai-savings-rate').innerText = `${analysis.keyMetrics.savingsRate}%`;
            document.getElementById('ai-tx-count').innerText = analysis.keyMetrics.transactionCount;
            document.getElementById('ai-net-savings').innerText = `₩${analysis.keyMetrics.netSavings.toLocaleString('ko-KR')}`;

            const insightsDiv = document.getElementById('ai-insights');
            insightsDiv.innerHTML = '';

            analysis.insights.forEach(insight => {
                const div = document.createElement('div');
                const iconColors = {
                    positive: 'bg-green-100 text-green-600',
                    warning: 'bg-yellow-100 text-yellow-600',
                    info: 'bg-blue-100 text-blue-600',
                    recommendation: 'bg-purple-100 text-purple-600'
                };

                div.className = 'flex gap-4 p-4 bg-gray-50 rounded-lg';
                div.innerHTML = `
                    <div class="w-10 h-10 rounded-full ${iconColors[insight.type]} flex items-center justify-center flex-shrink-0">
                        <i class="fa-solid fa-lightbulb"></i>
                    </div>
                    <div>
                        <h5 class="font-bold text-gray-800 mb-1">${insight.title}</h5>
                        <p class="text-sm text-gray-600">${insight.message}</p>
                    </div>
                `;
                insightsDiv.appendChild(div);
            });
        }
    }
};

// Initialize
window.addEventListener('load', () => {
    console.log('Cert Kokonut App Loaded');
});
