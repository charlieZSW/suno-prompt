document.addEventListener('DOMContentLoaded', () => {

    // 【重构】数据结构升级，支持子选项
    const promptData = {
        'STYLE/GENRE': [
            { name: 'Pop', subOptions: ['Synth-pop', 'Indie Pop', 'J-Pop', 'K-Pop', 'Hyperpop', 'Bubblegum Pop'] },
            { name: 'Rock', subOptions: ['Alternative Rock', 'Punk Rock', 'Hard Rock', 'Metal', 'Psychedelic Rock'] },
            { name: 'Jazz', subOptions: ['Smooth Jazz', 'Big Band', 'Swing', 'Bebop', 'Cool Jazz'] },
            'Lofi',
            { name: 'Electronic', subOptions: ['House', 'Techno', 'Trance', 'Drum and Bass', 'Dubstep', 'EDM'] },
            { name: 'Orchestral', subOptions: ['Symphony', 'Concerto', 'Chamber Music'] },
            { name: 'Folk', subOptions: ['Acoustic Folk', 'Folk Rock', 'Traditional Folk'] },
            { name: 'R&B', subOptions: ['Contemporary R&B', 'Soul', 'Funk', 'Neo-Soul'] },
            'Hip-hop',
            { name: 'Ambient', subOptions: ['Dark Ambient', 'Space Ambient'] },
            'Cinematic',
            'Chinese Style'
        ],
        'AMBIENCE/EMOTION': [
            { name: 'Positive Moods', subOptions: ['Happy', 'Uplifting', 'Energetic', 'Romantic'] },
            { name: 'Calm Moods', subOptions: ['Relaxing', 'Peaceful', 'Nostalgic'] },
            { name: 'Intense/Dark Moods', subOptions: ['Epic', 'Sad', 'Mysterious', 'Dark'] }
        ],
        'RHYTHM/BPM': ['Very Slow', 'Slow', 'Medium', 'Fast', 'Very Fast'],
        'ERA / DECADE': ['60s', '70s', '80s', '90s', '2000s', '2010s'],
        'MAIN INSTRUMENT': [
            { name: 'Keyboard Instruments', subOptions: ['Piano', 'Synthesizer'] },
            { name: 'Guitars', subOptions: ['Acoustic Guitar', 'Electric Guitar', 'Bass'] },
            { name: 'String Instruments', subOptions: ['Violin', 'Harp', 'Guzheng'] },
            { name: 'Wind Instruments', subOptions: ['Flute', 'Saxophone'] },
            { name: 'Percussion', subOptions: ['Drums'] }
        ],
        'PITCH / OCTAVE': [
            'High Pitch',
            'Mid Pitch',
            'Low Pitch',
            'Very Low Pitch'
        ],
        'MELODY TYPE': [
            { name: 'Melody Contour', subOptions: ['Soaring Melody', 'Descending Melody', 'Leaping Melody', 'Stepwise Melody'] },
            { name: 'Melody Feel', subOptions: ['Catchy Melody', 'Lyrical Melody', 'Haunting Melody', 'Playful Melody'] },
            { name: 'Melody Density', subOptions: ['Simple Melody', 'Complex Melody', 'Ornamented Melody'] },
            'Melody-driven'
        ],
        'KEYWORDS': [
            '8-bit',
            '16-bit',
            'Acapella',
            'Instrumental',
            { name: 'Male Vocal', subOptions: ['Deep Male Vocal', 'Tenor Vocal'] },
            { name: 'Female Vocal', subOptions: ['Soprano Vocal', 'Alto Vocal', 'Angelic Vocal'] },
            'Background Music',
            'Game Music',
            'Anime'
        ]
    };

    const categoriesContainer = document.querySelector('.categories');
    const outputTextarea = document.getElementById('prompt-output');
    const copyBtn = document.getElementById('copy-btn');
    const clearBtn = document.getElementById('clear-btn');

    // 【新增】统一管理所有的提示信息
    const tooltips = {
        '8-bit': 'Creates a retro video game sound, reminiscent of old Nintendo (NES) consoles. Also known as Chiptune.',
        '16-bit': 'Creates a more advanced retro video game sound, like from Super Nintendo (SNES) or Sega Genesis consoles.',
        'Acapella': 'Generates vocals only, without any instrumental backing. The AI will create harmonies and vocal percussion.',
        'Instrumental': 'For best results, check this and also toggle the "Instrumental" option on the Suno website to ensure purely instrumental music.'
    };

    // 【新增】创建一个全局唯一的 tooltip 元素
    const sharedTooltip = document.createElement('div');
    sharedTooltip.className = 'shared-tooltip';
    document.body.appendChild(sharedTooltip);

    // 1. 动态生成选项
    function populateOptions() {
        for (const category in promptData) {
            const accordion = categoriesContainer.querySelector(`.category-accordion[data-category="${category}"]`);
            if (accordion) {
                const panel = accordion.querySelector('.accordion-panel');
                const optionsContainer = document.createElement('div');
                optionsContainer.className = 'options-container';

                promptData[category].forEach(option => {
                    const optionWrapper = document.createElement('div');
                    optionWrapper.className = 'option-wrapper';

                    if (typeof option === 'string') {
                        optionWrapper.appendChild(createOption(option));
                    } 
                    else if (typeof option === 'object' && option.name) {
                        const { parentOption, subOptionsContainer } = createOption(option.name, true);
                        
                        option.subOptions.forEach(subOptionValue => {
                            const subOptionDiv = createOption(subOptionValue);
                            subOptionsContainer.appendChild(subOptionDiv);
                        });

                        optionWrapper.appendChild(parentOption);
                        optionWrapper.appendChild(subOptionsContainer);
                    }
                    optionsContainer.appendChild(optionWrapper);
                });
                panel.appendChild(optionsContainer);
            }
        }
    }
    
    // 【新增】创建单个选项的辅助函数，提高复用性
    function createOption(value, hasSubOptions = false) {
        const optionDiv = document.createElement('div');
        optionDiv.className = 'option';
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = value; // ID 简化
        checkbox.value = value;
        
        const label = document.createElement('label');
        label.htmlFor = value;
        label.textContent = value;
        
        optionDiv.appendChild(checkbox);
        optionDiv.appendChild(label);

        if (hasSubOptions) {
            optionDiv.classList.add('parent-option');
            const indicator = document.createElement('span');
            indicator.className = 'sub-option-indicator';
            indicator.textContent = '+';
            optionDiv.appendChild(indicator);

            const subOptionsContainer = document.createElement('div');
            subOptionsContainer.className = 'sub-options-container';
            
            return { parentOption: optionDiv, subOptionsContainer };
        }

        // 动态添加帮助图标
        if (tooltips[value]) {
            const tooltipContainer = document.createElement('div');
            tooltipContainer.className = 'tooltip-container';

            const helpIcon = document.createElement('span');
            helpIcon.className = 'help-icon';
            helpIcon.textContent = '?';
            helpIcon.dataset.tooltip = tooltips[value];

            helpIcon.addEventListener('mouseover', showTooltip);
            helpIcon.addEventListener('mouseout', hideTooltip);
            helpIcon.addEventListener('mousemove', moveTooltip);
            
            tooltipContainer.appendChild(helpIcon);
            optionDiv.appendChild(tooltipContainer);
        }
        
        return optionDiv;
    }

    // 2. 【重构】更新提示词逻辑，优先使用子选项
    function updatePrompt() {
        let promptParts = [];
        const accordions = categoriesContainer.querySelectorAll('.category-accordion');
        
        accordions.forEach(accordion => {
            const categoryValues = [];
            const wrappers = accordion.querySelectorAll('.option-wrapper');

            wrappers.forEach(wrapper => {
                const parentInput = wrapper.querySelector('.parent-option input[type="checkbox"]');
                const subOptionInputs = wrapper.querySelectorAll('.sub-options-container input[type="checkbox"]');

                if (parentInput && subOptionInputs.length > 0) { // It's a parent-child group
                    const checkedSubOptions = Array.from(subOptionInputs).filter(input => input.checked);
                    
                    if (checkedSubOptions.length > 0) {
                        // If sub-options are selected, use them and ignore the parent
                        const subValues = checkedSubOptions.map(input => input.value);
                        categoryValues.push(...subValues);
                    } else if (parentInput.checked) {
                        // If no sub-options are selected, use the parent (if it's checked)
                        categoryValues.push(parentInput.value);
                    }
                } else { // It's a simple option
                    const simpleInput = wrapper.querySelector('.option input[type="checkbox"]');
                    if (simpleInput && simpleInput.checked) {
                        categoryValues.push(simpleInput.value);
                    }
                }
            });

            if (categoryValues.length > 0) {
                promptParts.push(categoryValues.join(', '));
            }
        });

        outputTextarea.value = promptParts.join(', ');
    }

    // 3. 复制功能
    function copyPrompt() {
        if (outputTextarea.value.trim() === '') {
            alert('Nothing to copy!');
            return;
        }
        navigator.clipboard.writeText(outputTextarea.value).then(() => {
            const originalText = copyBtn.textContent;
            copyBtn.textContent = 'COPIED!';
            setTimeout(() => {
                copyBtn.textContent = originalText;
            }, 1500);
        }).catch(err => {
            console.error('Copy failed: ', err);
            alert('Copy failed, please copy manually.');
        });
    }

    // 4. 清空功能
    function clearSelections() {
        const checkedInputs = categoriesContainer.querySelectorAll('input[type="checkbox"]:checked');
        checkedInputs.forEach(input => input.checked = false);
        updatePrompt();
    }

    // 5. 【新增】Tooltip 的显示/隐藏/移动函数
    function showTooltip(e) {
        const icon = e.currentTarget;
        sharedTooltip.textContent = icon.dataset.tooltip;
        sharedTooltip.classList.add('visible');
        moveTooltip(e); // 立即定位
    }

    function hideTooltip() {
        sharedTooltip.classList.remove('visible');
    }

    function moveTooltip(e) {
        // 让 tooltip 跟随鼠标，并有一点偏移
        sharedTooltip.style.left = `${e.clientX + 15}px`;
        sharedTooltip.style.top = `${e.clientY + 15}px`;
    }

    // 6. 【重构】处理子选项和父选项联动的逻辑
    function handleParentCheckboxLogic() {
        const parentCheckboxes = document.querySelectorAll('.parent-option input[type="checkbox"]');
        parentCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                // 取消父选项时，取消所有子选项
                if (!e.target.checked) {
                    const subCheckboxes = e.target.closest('.option-wrapper').querySelectorAll('.sub-options-container input[type="checkbox"]');
                    subCheckboxes.forEach(sub => sub.checked = false);
                }
            });
        });
    }

    function handleChildCheckboxLogic() {
        const subCheckboxes = document.querySelectorAll('.sub-options-container input[type="checkbox"]');
        subCheckboxes.forEach(subCheckbox => {
            subCheckbox.addEventListener('change', () => {
                const wrapper = subCheckbox.closest('.option-wrapper');
                if (wrapper) {
                    const parentCheckbox = wrapper.querySelector('.parent-option input[type="checkbox"]');
                    const allSubCheckboxes = wrapper.querySelectorAll('.sub-options-container input[type="checkbox"]');
                    const anySubChecked = Array.from(allSubCheckboxes).some(sub => sub.checked);

                    if (anySubChecked) {
                        parentCheckbox.checked = true;
                    }
                }
            });
        });
    }

    // 7. 【重构】设置子选项折叠/展开交互，使用 scrollHeight 以获得平滑动画
    function setupSubOptionToggles() {
        const parentOptions = document.querySelectorAll('.parent-option');
        parentOptions.forEach(p_option => {
            p_option.addEventListener('click', (e) => {
                // 防止点击 checkbox 本身时触发两次事件
                if (e.target.type === 'checkbox') {
                    return;
                }
                const wrapper = p_option.closest('.option-wrapper');
                const subOptionsContainer = wrapper.querySelector('.sub-options-container');
                const isOpen = wrapper.classList.toggle('is-open');

                // 更新 +/- 指示器
                const indicator = p_option.querySelector('.sub-option-indicator');
                if (indicator) {
                    indicator.textContent = isOpen ? '−' : '+';
                }

                // 使用 JS 控制 max-height 以实现平滑动画
                if (isOpen) {
                    subOptionsContainer.style.maxHeight = subOptionsContainer.scrollHeight + 'px';
                } else {
                    subOptionsContainer.style.maxHeight = null;
                }

                // 【关键修复】更新父级 Accordion 的高度以适应子选项
                const mainAccordionPanel = p_option.closest('.accordion-panel');
                if (mainAccordionPanel && mainAccordionPanel.style.maxHeight) {
                    // 使用 setTimeout 给浏览器一点时间来重新计算布局
                    setTimeout(() => {
                        mainAccordionPanel.style.maxHeight = mainAccordionPanel.scrollHeight + 'px';
                    }, 150); // 延迟略微增加以匹配动画
                }
            });
        });
    }

    // 8. 【重构】设置 Accordion 交互，使用固定大高度代替 scrollHeight
    function setupAccordions() {
        const headers = categoriesContainer.querySelectorAll('.accordion-header');
        
        headers.forEach(clickedHeader => {
            clickedHeader.addEventListener('click', () => {
                const accordion = clickedHeader.parentElement;
                const panel = clickedHeader.nextElementSibling;
                const wasActive = accordion.classList.contains('active');

                // 关闭所有
                categoriesContainer.querySelectorAll('.category-accordion').forEach(acc => {
                    acc.classList.remove('active');
                    acc.querySelector('.accordion-panel').style.maxHeight = null;
                    const icon = acc.querySelector('.accordion-icon');
                    if (icon) icon.textContent = '+';
                });

                // 如果点击的不是已激活的，则展开它
                if (!wasActive) {
                    accordion.classList.add('active');
                    // 【修复】使用 scrollHeight 代替固定值，解决父级收起延迟问题
                    panel.style.maxHeight = panel.scrollHeight + "px"; 
                    const icon = clickedHeader.querySelector('.accordion-icon');
                    if (icon) icon.textContent = '−';
                }
            });
        });
    }

    // 初始化和事件监听
    populateOptions();
    handleParentCheckboxLogic();
    handleChildCheckboxLogic();
    setupSubOptionToggles();
    setupAccordions();
    categoriesContainer.addEventListener('change', updatePrompt);
    copyBtn.addEventListener('click', copyPrompt);
    clearBtn.addEventListener('click', clearSelections);
}); 