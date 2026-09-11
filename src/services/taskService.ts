export const findTasks = async (filters: any, taskRepo: any) => {
  const queryOptions: any = {
    where: {},
    order: {},
  };

  const filterMapping: Record<string, (val: any) => any> = {
    status: (val: any) => ({ done: val === "done" }),
    priority: (val: any) => ({ priority: val }),
    assignedTo: (val: any) => ({ userId: val }),
  };

  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && filterMapping[key]) {
      Object.assign(queryOptions.where, filterMapping[key](value));
    }
  }

  if (filters.sortBy) {
    const direction = filters.sortOrder ? filters.sortOrder : "desc";
    queryOptions.order[filters.sortBy] = direction.toUpperCase();
  } else {
    queryOptions.order = { createdAt: "DESC" };
  }

  let limit = filters.limit ? parseInt(filters.limit, 10) : 20;
  const offset = filters.offset ? parseInt(filters.offset, 10) : 0;

  if (limit > 100) limit = 100;
  if (limit < 1) limit = 20;

  queryOptions.take = limit;
  queryOptions.skip = offset;
  
  if (filters.include === "user") {
    queryOptions.relations = ["user"];
  }

  const [tasks, total] = await taskRepo.findAndCount(queryOptions);

  const hasMore = offset + limit < total;

  return {
    data: tasks,
    meta: {
      total: total,
      limit: limit,
      offset: offset,
      hasMore: hasMore,
    },
  };
};