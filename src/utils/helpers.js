export function formatList(items) {
  return new Intl.ListFormat("pt-BR", {
    style: "long",
    type: "conjunction"
  }).format(items);
}
