import t from 'tcomb';

export function nonEmptyList(type, name) {
  return t.refinement(
    t.list(type, name),
    array => array.length > 0,
    name || `NonEmptyList<${ t.getTypeName(type) }>`
  )
}
