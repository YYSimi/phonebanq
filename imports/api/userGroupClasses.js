export var UserGroupRankEnum = {
    owner: 10,
    admin: 7,
    deputy: 4,
    member: 1,
    unknown: 0
}

export function hasEditPermissionsByRank(rank) {
    return rank >= UserGroupRankEnum.deputy;
}

export function UserGroup(name, owner_id, admin_ids, deputy_ids) {
    this.name = name;
    this.owner_id = owner_id;
    this.admin_ids = admin_ids || [];
    this.deputy_ids = deputy_ids || [];
};