// async createRecord<Cols extends Array<TTableColumns<T>>>(params: {
//     data: InferInsertModel<T>;
//     returnColumns: Cols | 'all';
//     onConflict?: TOnConflict<T>;
// }): Promise<{ [K in Cols[number]]: T['_']['columns'][K]['_']['data'] }>;
// async createRecord(params: {
//     data: InferInsertModel<T>;
//     returnColumns?: undefined;
//     onConflict?: TOnConflict<T>;
// }): Promise<void>;
// async createRecord<Cols extends Array<TTableColumns<T>>>(params: {
//     data: InferInsertModel<T>;
//     returnColumns?: Cols | 'all' | undefined;
//     onConflict?: TOnConflict<T>;
// }): Promise<{ [K in Cols[number]]: T['_']['columns'][K]['_']['data'] } | void> {
//     const columns =
//         params.returnColumns === 'all'
//             ? this.getColumns()
//             : this.buildSelectColumns(params.returnColumns);

//     // Build dynamic query with conflict resolution
//     let query = db.insert(this.table).values(params.data).$dynamic();

//     // Build on conflict
//     query = this.buildOnConflict(query, params.onConflict);

//     if (columns) {
//         const result = await query.returning(columns);
//         return result[0] ?? null;
//     }

//     await query;

//     // The query layer returns object or null. The service layer will handle the error if the record is not created
//     // return newRecord[0] ?? null;
// }
