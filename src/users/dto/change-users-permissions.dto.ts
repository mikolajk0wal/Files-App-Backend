import { IsEnum } from 'class-validator';

export enum NewRole {
  normal = 'normal',
  moderator = 'moderator',
}

export class ChangeUsersPermissionsDto {
  @IsEnum(NewRole)
  newRole: 'normal' | 'moderator';
}
