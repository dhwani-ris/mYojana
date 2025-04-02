class SchemeEligibleBen {
    constructor(frm = null, wrapper = null) {
        // debugger
        this.frm = frm;
        this.wrapper = wrapper;
        this.eligible_ben = [];
        this.total_pages = 1;
        this.currentPage = 1;
        if (frm) {
            this.show_table();
        }
        this.filters = [{
            name_of_the_beneficiary: '',
            name_of_parents: '',
            custom_custon_contact_number: '',
            block_name: ''
        }]
    }
    getRandomColor() {
        const letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }
    stripHtmlTags(input) {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = input;
        return tempDiv.textContent || tempDiv.innerText || '';
    }
    getActionBar() {
        let el = document.createElement('div');
        el.className = 'd-flex pb-4 justify-content-between align-items-center';
        el.style = 'gap: 20px;'
        el.innerHTML = ` 
                <div class="d-flex " style="gap: 10px;">
                    <input id="name_of_beneficiary" type="text" class="form-control form-control-sm" placeholder="Name of beneficiary">
                    <input id="name_of_parents" type="text" class="form-control form-control-sm" placeholder="Primary member">
                    <input id="phone_number" type="number" class="form-control form-control-sm" placeholder="Phone number">
                    <input id="block_name" type="text" class="form-control form-control-sm" placeholder="Block">
                    <button id="clearFilters" class="btn btn-secondary btn-sm" style="display: none;">
                        x
                    </button>
                </div>
                <button id="bulkDeleteButton" class="btn btn-primary btn-sm primary-action">
                        Export
                </button>
                `
        return el;
    }
    createTable() {
        let el = document.createElement('div');
        el.className = 'form-grid-container form-grid';
        el.style = 'overflow-y:auto;'
        el.innerHTML = `
            <table style="margin: 0px !important;" class="table table-bordered">
                <thead style="font-size: 12px;">
                    <tr>
                        <th class="row-check sortable-handle col" style="width: 40px;min-width:40px;text-align: center; position: sticky; left: 0px; background-color: #F8F8F8;">
                            #
                        </th>
                        <th class="static-area ellipsis" style="color:#525252; font-size: 13px;">Name of the Beneficiary</th>
                        <th class="static-area ellipsis" style="color:#525252; font-size: 13px;">Head of household</th>
                        <th class="static-area ellipsis" style="color:#525252; font-size: 13px;">Contact nubmer</th>
                        <th class="static-area ellipsis" style="color:#525252; font-size: 13px;">Cluster</th>
                        <th class="static-area ellipsis" style="color:#525252; font-size: 13px;">Slum</th>
                    </tr>
                </thead>
                <tbody style="background-color: #fff; font-size: 12px;">
                    ${this.eligible_ben?.data?.length === 0
                ? `
                        <tr>
                            <td colspan="9" style="height:92px; text-align: center; font-size: 14px; color: #6c757d; background-color: #F8F8F8; line-height: 92px;">
                                No rows
                            </td>
                        </tr>
                        `
                : this.eligible_ben?.data?.map((item,index) => `
                        <tr class="grid-row">
                            <td class="row-check sortable-handle col" style="width: 40px;min-width:40px; text-align: center; position: sticky; left: 0px; background-color: #fff;">
                                ${index + 1}
                            </td>
                            <td class="col grid-static-col col-xs-3 ">
                                <a href="/app/beneficiary-profiling/${item?.name}">${item.name_of_the_beneficiary}</a>
                            </td>
                            <td style="white-space: nowrap;">${item.name_of_parents ?? ``}</td>
                            <td style="white-space: nowrap;">${item.contact_number ?? ``}</td>
                            <td style="white-space: nowrap;font-size: 12px !important;">${item.block_name ?? ``}</td>
                            <td style="white-space: nowrap;font-size: 12px !important;">${item.village_name ?? ``}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `
        return el;
    }
    createFooter() {
        let el = document.createElement('div');
        el.className = 'd-flex py-2 justify-content-between align-items-center';
        el.style = 'gap: 10px;'
        let totalPages = this.total_pages;
        let currentPage = this.currentPage;

        const getPagination = () => {
            if (totalPages <= 7) {
                return Array.from({ length: totalPages }, (_, i) => i + 1);
            }

            let pages = new Set([1, 2, totalPages - 1, totalPages]);

            if (currentPage > 3) pages.add(currentPage - 1);
            if (currentPage > 2) pages.add(currentPage);
            if (currentPage < totalPages - 1) pages.add(currentPage + 1);

            let result = [];
            let prev = 0;
            [...pages].sort((a, b) => a - b).forEach(page => {
                if (prev && page - prev > 1) {
                    result.push("...");
                }
                result.push(page);
                prev = page;
            });

            return result;
        };

        el.innerHTML = `
            <div class="d-flex flex-wrap justify-content-start align-items-center" style="gap: 8px;">
                <span>Total Beneficiary: ${this.eligible_ben?.count?.total ?? 0}</span>
                <span>Primary member: ${this.eligible_ben?.count?.family_count ?? 0}</span>
                <span>Block count: ${this.eligible_ben?.count?.block_count ?? 0}</span>
                <span>Settlement count: ${this.eligible_ben?.count?.settlement_count ?? 0}</span>
            </div>
            ${totalPages > 1 ? `
                <nav aria-label="Page navigation">
                    <ul class="pagination">
                        <li class="page-item">
                            <a style="padding: 0.35rem 0.75rem !important;" class="page-link prev-page ${currentPage == 1 ? 'disabled' : ''}" aria-label="Previous">
                                <span aria-hidden="true">&laquo;</span>
                            </a>
                        </li>
                        ${getPagination().map(p => `
                            <li class="page-item ${p == currentPage ? 'active' : ''} ${p === "..." ? "disabled" : ""}">
                                <a style="padding: 0.35rem 0.75rem !important;" class="page-link">${p}</a>
                            </li>
                        `).join('')}
                        <li class="page-item">
                            <a style="padding: 0.35rem 0.75rem !important;" class="page-link next-page ${currentPage == totalPages ? 'disabled' : ''}" aria-label="Next">
                                <span aria-hidden="true">&raquo;</span>
                            </a>
                        </li>
                    </ul>
                </nav>
            ` : ''}
        `;

        return el;
    }

    noDataFound() {
        let el = document.createElement('div');
        el.style = 'flex-direction: column; height: 200px;'
        e.addClass('d-flex justify-content-center align-items-center')
        el.innerHTML = `
            <svg class="icon icon-xl" style="stroke: var(--text-light);">
                <use href="#icon-small-file"></use>
            </svg>
            <p class="text-muted">You haven't created a Recored yet</p>
        `
        return el;
    }
    async show_table() {
        let limit = 50;
        let start = (this.currentPage - 1) * limit;
        this.eligible_ben = await callAPI({
            method: 'myojana.api.eligible_beneficiaries',
            freeze: false,
            args: {
                scheme: this.frm.doc.name,
                columns: ["name", "serial_no", "name_of_the_beneficiary", "select_primary_member.name_of_parents", "contact_number", "ward.block_name", "name_of_the_settlement.village_name"],
                filters: this.filters ?? [],
                start: start,
                page_imit: limit,
                is_limit: true,
            },
            // freeze_message: __("Getting beneficiaries..."),
        })
        this.total_pages = Math.ceil(this.eligible_ben?.count?.total / limit);
        this.currentPage = Math.max(1, Math.min(this.currentPage, this.total_pages));

        if (document.getElementById('task-list')) {
            document.getElementById('eligible_ben-body').remove();
            document.getElementById('eligible_ben-footer').remove();
        }
        let task_container = document.createElement('div');
        task_container.classList.add('task-list');
        task_container.id = 'task-list';
        task_container.innerHTML = `
            <div id="eligible_ben-header"></div>
            <div id="eligible_ben-body"></div>
            <div id="eligible_ben-footer"></div>
        `;
        if(!document.getElementById('eligible_ben-header')){
            task_container.querySelector('#eligible_ben-header').appendChild(this.getActionBar());
        }
        task_container.querySelector('#eligible_ben-body').appendChild(this.createTable());
        task_container.querySelector('#eligible_ben-footer').appendChild(this.createFooter());
        this.wrapper.appendChild(task_container);

        // Function to toggle Clear Filters button visibility
        const toggleClearFiltersButton = () => {
            const filtersApplied =
                $('#name_of_beneficiary').val().trim() !== '' ||
                $('#name_of_parents').val().trim() !== '' ||
                $('#phone_number').val().trim() !== '' ||
                $('#block_name').val().trim() !== '';
            $('#clearFilters').css('display', filtersApplied ? 'inline-block' : 'none');
        };

        // Pagination events
        $(document).off('click', '.page-link').on('click', '.page-link', (e) => {
            let page = Number($(e.target).text());
            if (!isNaN(page)) {
                this.currentPage = page;
                this.show_table();
            }
        });

        $(document).off('click', '.prev-page').on('click', '.prev-page', (e) => {
            if (this.currentPage > 1) {
                this.currentPage--;
                this.show_table();
            }
        });

        $(document).off('click', '.next-page').on('click', '.next-page', (e) => {
            if (this.currentPage < this.total_pages) {
                this.currentPage++;
                this.show_table();
            }
        });

        // Filter input events with toggle
        $(document).off('keyup', '#name_of_beneficiary').on('keyup', '#name_of_beneficiary', (e) => {
            let name_of_beneficiary = $(e.target).val();
            this.filters[0].name_of_the_beneficiary = name_of_beneficiary;
            this.show_table();
            toggleClearFiltersButton();
        });

        $(document).off('keyup', '#name_of_parents').on('keyup', '#name_of_parents', (e) => {
            let name_of_parents = $(e.target).val();
            this.filters[0].name_of_parents = name_of_parents;
            this.show_table();
            toggleClearFiltersButton();
        });

        $(document).off('keyup', '#phone_number').on('keyup', '#phone_number', (e) => {
            let phone_number = $(e.target).val();
            this.filters[0].custom_custon_contact_number = Number(phone_number);
            this.show_table();
            toggleClearFiltersButton();
        });

        $(document).off('keyup', '#block_name').on('keyup', '#block_name', (e) => {
            let block_name = $(e.target).val();
            this.filters[0].block_name = block_name;
            this.show_table();
            toggleClearFiltersButton();
        });

        // Export
        $(document).off('click', '#bulkDeleteButton').on('click', '#bulkDeleteButton', async(e) => {
            let data = await callAPI({
                method: 'myojana.api.eligible_beneficiaries',
                freeze: false,
                args: {
                    scheme: this.frm.doc.name,
                    columns: ["name", "serial_no", "name_of_the_beneficiary", "select_primary_member.name_of_parents", "contact_number", "ward.block_name", "name_of_the_settlement.village_name"],
                    filters: [],
                    start: 0
                },
                // freeze_message: __("Getting beneficiaries..."),
            })
            this.convertJSONToCSV(data.data, 'Eligible Beneficiary');
        });

        // Clear Filters with toggle
        $(document).off('click', '#clearFilters').on('click', '#clearFilters', (e) => {
            $('#name_of_beneficiary').val('');
            $('#name_of_parents').val('');
            $('#phone_number').val('');
            $('#block_name').val('');
            this.filters = [{ // Reset filters object
                name_of_the_beneficiary: '',
                name_of_parents: '',
                custom_custon_contact_number: '',
                block_name: ''
            }];
            this.show_table();
            toggleClearFiltersButton(); // Hide button after clearing
        });

        // Initial toggle check
        toggleClearFiltersButton();
    }
    convertJSONToCSV(jsonData, fileName) {
        // Convert JSON to CSV format
        const csvContent = [];
        const keys = Object.keys(jsonData[0]);
        csvContent.push(keys.join(','));

        jsonData.forEach(entry => {
            const values = keys.map(key => {
                let value = entry[key];
                if (typeof value === 'string') {
                    value = `"${value}"`; // Enclose in double quotes to handle commas within strings
                }
                return value;
            });
            csvContent.push(values.join(','));
        });

        // Create CSV file
        const csvString = csvContent.join('\n');
        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        if (navigator.msSaveBlob) { // IE 10+
            navigator.msSaveBlob(blob, fileName);
        } else {
            const link = document.createElement('a');
            if (link.download !== undefined) {
                const url = URL.createObjectURL(blob);
                link.setAttribute('href', url);
                link.setAttribute('download', fileName);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            } else {
                alert('Your browser does not support downloading files. Please try a different browser.');
            }
        }
    }
}