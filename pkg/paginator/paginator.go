package paginator

func Paginate(page, pageSize int) (limit, offset int) {
    if page < 1 {
        page = 1
    }
    if pageSize < 1 {
        pageSize = 10
    }
    offset = (page - 1) * pageSize
    limit = pageSize
    return
}
