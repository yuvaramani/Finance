<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class IncomeSource extends Model
{
    use HasFactory;

    protected $fillable = [
        'source_name',
    ];

    protected $appends = ['name'];

    public function getNameAttribute(): string
    {
        return $this->attributes['source_name'];
    }

    public function incomes(): HasMany
    {
        return $this->hasMany(Income::class, 'source_id');
    }
}

