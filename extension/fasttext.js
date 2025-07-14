// Adapted from https://github.com/loretoparisi/fasttext.js for browser use
class FastText {
    constructor() {
        this.model = null;
        this.wasmReady = false;
    }

    async initWasm() {
        // Placeholder for WASM initialization (FastText.js requires WebAssembly)
        // In practice, this would load fasttext.wasm (not bundled here for simplicity)
        console.log('Initializing FastText WASM');
        // Mock WASM loading (replace with actual WASM loading if using full library)
        this.wasmReady = true;
        return Promise.resolve();
    }

    async loadModel(modelPath) {
        if (!this.wasmReady) {
            await this.initWasm();
        }
        try {
            console.log('Loading model from:', modelPath);
            const response = await fetch(modelPath);
            if (!response.ok) {
                throw new Error(`Failed to fetch model: ${response.statusText}`);
            }
            const buffer = await response.arrayBuffer();
            // Mock model parsing (in real fasttext.js, this would use WASM to load .bin)
            this.model = this.parseModel(buffer);
            console.log('FastText model loaded successfully');
        } catch (error) {
            console.error('Failed to load FastText model:', error);
            throw error;
        }
    }

    parseModel(buffer) {
        // Mock parsing for demo (replace with actual fasttext.js model loading)
        return {
            predict: (text, k = 1) => {
                console.log('Predicting for text:', text);
                const lowerText = text.toLowerCase();
                const labels = [
                    'first_name', 'middle_name', 'last_name', 'present_address', 'permanent_address',
                    'country', 'state', 'phone', 'gender', 'age',
                    'school_name', 'school_year', 'school_grade', 'school_stream',
                    'junior_college_name', 'junior_college_start_year', 'junior_college_end_year',
                    'junior_college_grade', 'junior_college_stream',
                    'degree1_name', 'degree1_start_year', 'degree1_end_year', 'degree1_grade', 'degree1_major',
                    'degree2_name', 'degree2_start_year', 'degree2_end_year', 'degree2_grade', 'degree2_major',
                    'job1_company', 'job1_role', 'job1_start_date', 'job1_end_date', 'job1_domain',
                    'job2_company', 'job2_role', 'job2_start_date', 'job2_end_date', 'job2_domain'
                ];
                for (const label of labels) {
                    if (lowerText.includes(label.replace('_', ' '))) {
                        return [{ label: `__label__${label}`, probability: 0.9 }];
                    }
                }
                return [{ label: '__label__unknown', probability: 0.1 }];
            }
        };
    }

    async predict(text, k = 1) {
        if (!this.model) {
            throw new Error('Model not loaded');
        }
        return this.model.predict(text, k);
    }
}

window.FastText = FastText;