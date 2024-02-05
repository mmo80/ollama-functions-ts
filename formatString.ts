export function fillTemplate(template: string, values: any) {
    return template.split(/\{|\}/).map((segment, index) =>
        index % 2 === 0 ? segment : values[segment]
    ).join('');
}
