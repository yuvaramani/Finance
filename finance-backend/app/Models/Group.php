<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Group extends Model
{
    use HasFactory;

    protected $table = 'groups';

    protected $fillable = [
        'GroupName',
    ];

    protected $appends = ['name'];

    public function getNameAttribute(): string
    {
        return $this->attributes['GroupName'];
    }

    public function accounts()
    {
        return $this->hasMany(Account::class, 'group_id');
    }
}



