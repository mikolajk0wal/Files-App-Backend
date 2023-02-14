import { Injectable, NestMiddleware } from '@nestjs/common';
import { FileSchema } from '../files/schema/file.schema';

@Injectable()
export class GetFileFiltersMiddleware implements NestMiddleware {
  use(req, res, next) {
    const availableFilters = Object.keys(FileSchema.paths);
    const filters = req.query;
    const filtersKeys = Object.keys(filters);

    let schemaFilters = {};
    availableFilters.forEach((filter) => {
      if (filtersKeys.includes(filter)) {
        if (filter === 'subject') {
          schemaFilters['subject'] = new RegExp(`.*${filters[filter]}*.`, 'i');
        } else {
          schemaFilters[filter] = filters[filter];
        }
      }
    });
    let searchFilter = {};
    if (filters.q) {
      searchFilter = {
        $text: {
          $search: filters.q,
        },
      };
    }

    req.filters = { ...schemaFilters };
    next();
  }
}
