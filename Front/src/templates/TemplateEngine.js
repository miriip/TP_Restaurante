/**
 * Template Engine
 * Sistema de templates para renderizar componentes dinámicos
 */
export class TemplateEngine {
    constructor() {
        this.templates = new Map();
        this.loadTemplates();
    }

    async loadTemplates() {
        // Cargar templates de componentes
        const templateModules = [
            'DishCard',
            'OrderCard', 
            'CartItem',
            'OrderDetails'
        ];

        for (const templateName of templateModules) {
            try {
                const module = await import(`./${templateName}.js`);
                this.templates.set(templateName, module.default);
            } catch (error) {
                console.warn(`Template ${templateName} not found:`, error);
            }
        }
    }

    render(templateName, data) {
        const template = this.templates.get(templateName);
        if (!template) {
            console.error(`Template ${templateName} not found`);
            return '';
        }

        return template(data);
    }

    registerTemplate(name, templateFunction) {
        this.templates.set(name, templateFunction);
    }
}

export const templateEngine = new TemplateEngine();
